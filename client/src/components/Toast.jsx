import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../redux/slices/toastSlice';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Toast = ({ toast }) => {
    const dispatch = useDispatch();
    const { id, message, type = 'info', duration = 3000, link } = toast;

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeToast(id));
        }, duration);

        return () => clearTimeout(timer);
    }, [dispatch, id, duration]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
        error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
        info: <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />
    };

    const bgColors = {
        success: 'bg-emerald-50/95 border-emerald-300 shadow-emerald-900/10 text-emerald-950',
        error: 'bg-rose-50/95 border-rose-300 shadow-rose-900/10 text-rose-950',
        warning: 'bg-amber-50/95 border-amber-300 shadow-amber-900/10 text-amber-950',
        info: 'bg-teal-50/95 border-teal-300 shadow-teal-900/10 text-teal-950'
    };

    return (
        <div className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-md animate-slide-in max-w-[90vw] sm:max-w-md ${bgColors[type] || bgColors.info} transition-all duration-300`}>
            {icons[type] || icons.info}
            <div className="flex-1 text-xs sm:text-sm font-semibold leading-snug">
                {message}
                {link && (
                    <Link
                        to={link.url}
                        onClick={() => dispatch(removeToast(id))}
                        className="ml-2 underline font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                    >
                        {link.text || 'View'}
                    </Link>
                )}
            </div>
            <button
                onClick={() => dispatch(removeToast(id))}
                className="p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-colors"
                aria-label="Close notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const ToastContainer = () => {
    const { toasts } = useSelector((state) => state.toast);

    return (
        <div className="fixed top-20 right-3 sm:right-6 z-[9999] space-y-2.5 pointer-events-none flex flex-col items-end">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
