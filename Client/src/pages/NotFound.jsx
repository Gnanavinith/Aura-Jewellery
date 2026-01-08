import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
      <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
        Go back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
