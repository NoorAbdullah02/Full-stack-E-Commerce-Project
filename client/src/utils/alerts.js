import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import confetti from 'canvas-confetti';

// Green Petals SweetAlert2 Custom Styling & Utilities
export const GreenAlert = Swal.mixin({
    customClass: {
        popup: 'glass rounded-3xl p-6 shadow-2xl border border-emerald-100',
        title: 'text-2xl font-bold text-gray-900 font-sans',
        htmlContainer: 'text-gray-600 text-sm sm:text-base leading-relaxed',
        confirmButton: 'btn-primary px-6 py-3 rounded-xl font-bold mx-2 shadow-lg hover:shadow-emerald-500/25 transition-all',
        cancelButton: 'px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 mx-2 transition-all',
    },
    buttonsStyling: false,
    backdrop: `rgba(6, 78, 59, 0.4) backdrop-blur-sm`,
});

// Toast notification using SweetAlert2
export const showToast = ({ icon = 'success', title = '', timer = 3000, position = 'top-end' }) => {
    return Swal.fire({
        toast: true,
        position: position,
        icon: icon,
        title: title,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        customClass: {
            popup: 'rounded-2xl shadow-xl border border-emerald-200 bg-white/95 backdrop-blur-md px-4 py-3 text-sm font-medium',
            title: 'text-gray-800 text-sm font-semibold',
        }
    });
};

// Celebration Confetti
export const triggerConfetti = () => {
    try {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
            colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#ec4899']
        });
        fire(0.2, {
            spread: 60,
            colors: ['#10b981', '#047857', '#6ee7b7']
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    } catch (e) {
        console.error('Confetti trigger error:', e);
    }
};

// Order Placed Celebration Dialog
export const showOrderSuccess = ({ orderId, total, isBkash, transactionId }) => {
    triggerConfetti();

    return GreenAlert.fire({
        icon: 'success',
        title: '🌿 Order Placed Successfully!',
        html: `
            <div class="space-y-3 py-2 text-left">
                <p class="text-center text-emerald-800 font-semibold mb-4">
                    Thank you for choosing Green Petals! Your healthy plants will be carefully packed and nurtured.
                </p>
                <div class="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 text-sm space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Order ID:</span>
                        <span class="font-mono font-bold text-emerald-950">${orderId ? orderId.slice(0, 10).toUpperCase() : 'GP-' + Date.now().toString().slice(-6)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Total Amount:</span>
                        <span class="font-bold text-emerald-700">৳${Number(total).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Payment:</span>
                        <span class="font-semibold text-gray-800">${transactionId ? 'bKash (TrxID: ' + transactionId + ')' : 'bKash Send Money'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Nursery Hotline:</span>
                        <span class="font-semibold text-emerald-700">01768686120</span>
                    </div>
                </div>
                <p class="text-xs text-gray-500 text-center pt-2">
                    Confirmation details have been dispatched. You can track this order in your profile anytime.
                </p>
            </div>
        `,
        confirmButtonText: 'View My Orders 📦',
        allowOutsideClick: false,
    });
};

// General Success Modal
export const showSuccess = (title, message) => {
    return GreenAlert.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonText: 'OK',
    });
};

// General Error Modal
export const showError = (title, message) => {
    return GreenAlert.fire({
        icon: 'error',
        title: title || 'Oops...',
        text: message || 'Something went wrong. Please try again.',
        confirmButtonText: 'Close',
    });
};

// Confirmation Modal
export const showConfirm = async ({ title, text, confirmButtonText = 'Yes, Confirm', cancelButtonText = 'Cancel' }) => {
    const result = await GreenAlert.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
    });
    return result.isConfirmed;
};
