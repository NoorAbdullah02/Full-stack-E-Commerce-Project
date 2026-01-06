import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../redux/slices/toastSlice';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ toast }) => {
    const dispatch = useDispatch();
    const { id, message, type, duration } = toast;

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeToast(id));
        }, duration);

        return () => clearTimeout(timer);
    }, [dispatch, id, duration]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-amber-50 border-amber-200',
        info: 'bg-blue-50 border-blue-200'
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md animate-slide-in min-w-[300px] ${bgColors[type] || bgColors.info}`}>
            {icons[type] || icons.info}
            <p className="flex-1 text-sm font-medium text-gray-800">{message}</p>
            <button
                onClick={() => dispatch(removeToast(id))}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const ToastContainer = () => {
    const { toasts } = useSelector((state) => state.toast);

    return (
        <div className="fixed top-24 right-4 z-50 space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
