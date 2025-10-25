const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // fixed capitalization
const nodemailer = require("nodemailer");

// Function to generate a random 10-digit account number
const generateAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

const { sendWelcomeEmail } = require("../utils/emailService");


exports.signup = (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    User.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Hash password
            return bcrypt.hash(password, 10);
        })
        .then((hashedPassword) => {
            if (!hashedPassword) return; // prevent continuing if user exists

            // Generate account number
            const accountNumber = generateAccountNumber();

            // Create new user
            return User.create({
                fullName,
                email,
                password: hashedPassword,
                accountNumber,
                balance: 150000, // Initial balance
            });
        })
        .then((newUser) => {
            if (!newUser) return;

            // Create JWT token
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });

            sendWelcomeEmail(newUser.email, newUser.fullName);

            // Send success response
            res.status(201).json({
                message: "Signup successful",
                token,
                user: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    accountNumber: newUser.accountNumber,
                    balance: newUser.balance,
                },
            });
        })
        .catch((error) => {
            console.error("Signup Error:", error);
            res.status(500).json({ message: "Server error" });
        });
};

// ====================== SIGNIN CONTROLLER ======================
exports.signin = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            // Compare password
            bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (!isMatch) {
                        return res.status(400).json({ message: "Invalid credentials" });
                    }

                    // Create JWT token
                    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                        expiresIn: "7d",
                    });




                    res.json({
                        message: "Login successful",
                        token,
                        user: {
                            _id: user._id,
                            fullName: user.fullName,
                            email: user.email,
                            accountNumber: user.accountNumber,
                            balance: user.balance,
                            transactions: user.transactions || []
                        },
                    });

                })
                .catch((err) => {
                    console.error("Password Compare Error:", err);
                    res.status(500).json({ message: "Server error" });
                });
        })
        .catch((error) => {
            console.error("Signin Error:", error);
            res.status(500).json({ message: "Server error" });
        });
};

exports.transfer = (req, res) => {
    // console.log removed for privacy
    const { senderId, recipientAccount, amount } = req.body;
    const val = parseFloat(amount);

    //  Validate input
    if (!senderId || !recipientAccount || !val || val <= 0) {
        return res.status(400).json({ message: "Invalid transfer details" });
    }


    User.findById(senderId)
        .then((sender) => {
            if (!sender) {
                console.error(" Sender not found for senderId:", senderId);
                return res.status(404).json({ message: "Sender not found" });
            }


            User.findOne({ accountNumber: recipientAccount })
                .then((recipient) => {
                    if (!recipient) {
                        console.error("Recipient not found for accountNumber:", recipientAccount);
                        return res.status(404).json({ message: "Recipient not found" });
                    }


                    if (sender.balance < val) {
                        return res.status(400).json({ message: "Insufficient funds" });
                    }

                    const date = new Date().toISOString().slice(0, 10);


                    const senderTransaction = {
                        type: "debit",
                        amount: -val,
                        desc: `Transfer to ${recipient.fullName}`,
                        date,
                    };

                    const recipientTransaction = {
                        type: "credit",
                        amount: val,
                        desc: `Transfer from ${sender.fullName}`,
                        date,
                    };

                    User.findByIdAndUpdate(
                        sender._id,
                        {
                            $inc: { balance: -val },
                            $push: {
                                transactions: {
                                    $each: [senderTransaction],
                                    $position: 0, // add to the top
                                },
                            },
                        },
                        { new: true }
                    )
                        .then((updatedSender) => {
                            //  Update recipient atomically
                            User.findByIdAndUpdate(
                                recipient._id,
                                {
                                    $inc: { balance: val },
                                    $push: {
                                        transactions: {
                                            $each: [recipientTransaction],
                                            $position: 0,
                                        },
                                    },
                                },
                                { new: true }
                            )
                                .then(() => {
                                    res.status(200).json({
                                        message: "Transfer successful",
                                        newBalance: updatedSender.balance,
                                        transactions: updatedSender.transactions,
                                    });
                                })
                                .catch((err) => {
                                    console.error("Recipient Update Error:", err);
                                    res.status(500).json({ message: "Error updating recipient" });
                                });
                        })
                        .catch((err) => {
                            console.error("Sender Update Error:", err);
                            res.status(500).json({ message: "Error updating sender" });
                        });
                })
                .catch((err) => {
                    console.error("Recipient Find Error:", err);
                    res.status(500).json({ message: "Error finding recipient" });
                });
        })
        .catch((err) => {
            console.error("Sender Find Error:", err);
            res.status(500).json({ message: "Error finding sender" });
        });
};



exports.getTransactions = (req, res) => {
    const { userId } = req.params;
    user.findById(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ transactions: user.transactions });
        })
        .catch((err) => {
            console.error("Get Transactions Error:", err);
            res.status(500).json({ message: "Server error" });
        });
}

//  Get recipient info by account number
exports.getRecipient = (req, res) => {
    const { accountNumber } = req.params;

    if (!accountNumber) {
        return res.status(400).json({ message: "Account number is required" });
    }

    User.findOne({ accountNumber })
        .select("fullName accountNumber") // only send public info
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "Account not found" });
            }

            res.status(200).json({
                fullName: user.fullName,
                accountNumber: user.accountNumber,
            });
        })
        .catch((err) => {
            console.error("Recipient Lookup Error:", err.message);
            res.status(500).json({ message: "Server error" });
        });
};


