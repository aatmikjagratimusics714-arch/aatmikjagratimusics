require('dotenv').config();

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Endpoint to Create an Order
app.post("/create-order", async (req, res) => {
    const { courseId, courseType } = req.body;
    if (!courseId || !courseType) {
        return res.status(400).send("Course ID and Course Type are required");
    }
    const collectionName = courseType === 'live' ? 'liveCourses' : 'courses';
    try {
        const courseRef = db.collection(collectionName).doc(courseId);
        const courseDoc = await courseRef.get();
        if (!courseDoc.exists) {
            return res.status(404).send("Course not found");
        }
        const courseData = courseDoc.data();
        const priceInRupees = Number(courseData.price.replace("₹", ""));
        const amountInPaise = Math.round(priceInRupees * 100);
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${courseType}_${courseId}_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint to Verify Payment
app.post("/verify-payment", async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId,
        userId,
        courseType,
    } = req.body;
    if (!userId || !courseId || !courseType) {
        return res.status(400).send("User ID, Course ID, and Course Type are required");
    }
    try {
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest("hex");
        if (generated_signature !== razorpay_signature) {
            return res.status(400).send("Payment verification failed: Invalid signature");
        }
        const collectionName = courseType === 'live' ? 'liveCourses' : 'courses';
        const enrollmentField = courseType === 'live' ? 'enrolledLiveCourses' : 'enrolledCourses';
        const courseDoc = await db.collection(collectionName).doc(courseId).get();
        if (!courseDoc.exists) {
             return res.status(404).send("Course not found");
        }
        const courseData = courseDoc.data();
        const validityDays = courseData.validityDays ? parseInt(courseData.validityDays) : null;
        let expiryDateObject = new Date();
        if (validityDays && validityDays > 0) {
            expiryDateObject.setDate(expiryDateObject.getDate() + validityDays);
        } else {
            expiryDateObject.setFullYear(expiryDateObject.getFullYear() + 100);
        }
        const newEnrolledCourse = {
            courseId: courseId,
            expiryDate: admin.firestore.Timestamp.fromDate(expiryDateObject),
            purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
            paymentId: razorpay_payment_id,
        };
        const userDocRef = db.collection("users").doc(userId);
        await userDocRef.set({
            [enrollmentField]: admin.firestore.FieldValue.arrayUnion(newEnrolledCourse),
        }, { merge: true });
        res.status(200).json({ status: "success", courseId: courseId });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).send("Internal Server Error");
    }
});

exports.api = onRequest(app);
