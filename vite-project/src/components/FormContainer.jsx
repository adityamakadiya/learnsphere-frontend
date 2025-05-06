import { useNavigate } from "react-router-dom";

const FormContainer = ({
  title,
  error,
  onSubmit,
  children,
  cancelRoute,
  submitText,
  isSubmitting,
  isValid,
  maxWidth = "max-w-2xl",
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className={`bg-white p-12 rounded-2xl shadow-lg w-full ${maxWidth}`}>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {title}
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
        )}
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                isSubmitting || !isValid
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : submitText}
            </button>
            <button
              type="button"
              onClick={() => navigate(cancelRoute)}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormContainer;
