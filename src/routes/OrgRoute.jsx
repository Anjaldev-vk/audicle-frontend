import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const OrgRoute = ({ children }) => {
    const { user, isLoading } = useSelector((state) => state.auth);

    if (isLoading) return <div>Loading...</div>;

    if (!user?.organisation) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default OrgRoute;
