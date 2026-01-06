import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { userInfo } = useSelector((state) => state.auth);

    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && userInfo.role !== 'ADMIN' && userInfo.role !== 'SUPER_ADMIN') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
                <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
                    <p className="font-mono text-sm">Account: {userInfo.email}</p>
                    <p className="font-mono text-sm">Role: {userInfo.role}</p>
                </div>
                <a href="/" className="btn-primary px-6 py-2 rounded-xl">Go Home</a>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
