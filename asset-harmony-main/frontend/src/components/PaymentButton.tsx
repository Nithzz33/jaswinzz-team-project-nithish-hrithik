import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  amount: number;
  customerName?: string;
  onSuccess: () => void;
}

export default function PaymentButton({ amount, customerName, onSuccess }: Props) {

  const handlePayment = async () => {

    if (!amount || amount <= 0) {
      alert("Invalid payment amount");
      return;
    }

    try {

      console.log("Creating order for amount:", amount);

      const order = await axios.post(
        "https://asset-harmony-api.onrender.com/create-order",
        { amount: Math.round(amount) }
      );

      const options = {
        key: order.data.key,
        amount: order.data.amount,
        currency: "INR",
        name: "Office Inventory Mangement",
        description: "Product Purchase",
        order_id: order.data.order_id,

        handler: async function (response: any) {

          try {

            const verify = await axios.post(
              "https://asset-harmony-api.onrender.com/verify-payment",
              response
            );

            if (verify.data.status === "success") {
              onSuccess();
            } else {
              alert("Payment verification failed");
            }

          } catch (err) {
            console.error("Verification error:", err);
            alert("Verification failed");
          }
        },

        prefill: {
          name: customerName || "Walk-in Customer"
        },

        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {

      console.error(
        "Payment initialization error:",
        error.response?.data || error
      );

      alert("Payment initialization failed");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full h-10 bg-primary text-white rounded-lg font-semibold"
    >
      Pay with Razorpay
    </button>
  );
}