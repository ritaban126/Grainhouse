


// test-email.js  — place this in your ROOT server folder, not inside src

// import dotenv from "dotenv";
// dotenv.config();   // must be first before anything else

// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host:   process.env.MAIL_HOST,
//   port:   Number(process.env.MAIL_PORT),
//   secure: true,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// // Print what values are being read — to check .env loaded correctly
// console.log("HOST:", process.env.MAIL_HOST);
// console.log("PORT:", process.env.MAIL_PORT);
// console.log("USER:", process.env.MAIL_USER);
// console.log("PASS:", process.env.MAIL_PASS ? "✅ loaded" : "❌ missing");
// console.log("FROM:", process.env.MAIL_FROM);
// console.log("---sending email---");

// try {
//   const info = await transporter.sendMail({
//     from:    `"Grainhouse" <${process.env.MAIL_FROM}>`,
//     to:      "ritaban.rjp@gmail.com",  // ← put your real email here
//     subject: "Test from Grainhouse",
//     html:    "<h1>It works!</h1><p>Resend is connected.</p>",
//   });

//   console.log("✅ Email sent!", info.messageId);
// } catch (err) {
//   console.error("❌ Failed:", err.message);
// }