import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // BUYER 
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ITEMS 
    items: [
      {
        image: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Image",
          required: true,
        },

        // free / paid handling (snapshot at purchase time)
        accessType: {
          type: String,
          enum: ["free", "paid"],
          required: true,
        },

        licenseType: {
          type: String,
          enum: ["personal", "commercial", "extended"],
          required: true,
        },

        priceAtSale: {
          type: Number,
          default: 0,
        },

        creditsCost: {
          type: Number,
          default: 0,
        },

        contributor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        contributorEarning: {
          type: Number,
          default: 0,
        },

        // download control per item
        downloadCount: {
          type: Number,
          default: 0,
        },

        maxDownloads: {
          type: Number,
          default: 5,
        },
      },
    ],

    // PAYMENT 
    paymentMethod: {
      type: String,
      enum: ["stripe", "credits", "free"],
      default: "stripe",
    },

    stripeSessionId: {
      type: String,
      default: null,
    },

    stripePaymentId: {
      type: String,
      default: null,
    },

    stripeRefundId: {
      type: String,
      default: null,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    creditsUsed: {
      type: Number,
      default: 0,
    },

    // STATUS 
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    //  INVOICE
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// INDEXEs
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ "items.contributor": 1 });
orderSchema.index({ "items.image": 1 });

// INVOICE GENERATOR 
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.invoiceNumber = `IMG-${Date.now()}-${rand}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;