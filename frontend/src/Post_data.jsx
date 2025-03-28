import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as yup from "yup";

const PoststudentSchema = yup.object().shape({
  hallTicket: yup
    .string()
    .matches(
      /^2103A[1-4]\d{5}$/,
      "Invalid hall ticket format (e.g., 2103A112345)"
    )
    .required("Hall ticket is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  gpa: yup
    .number()
    .min(0, "GPA must be at least 0")
    .max(10, "GPA must not exceed 10")
    .required("GPA is required"),
});

function Post_Data() {
  const nav = useNavigate();
  const location = useLocation();
  const [apiKey, setApiKey] = useState(null);

  const [userName, setUserName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null); // New state for submission errors

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    const storedUser = localStorage.getItem("userName");

    if (storedUser) {
      setUserName(storedUser);
    }

    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      fetchApiKey();
    }
  }, []);

  const fetchApiKey = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/get-api-key", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        localStorage.setItem("apiKey", data.apiKey);
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
    }
  };

  const generateApiKey = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/generate-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        localStorage.setItem("apiKey", data.apiKey);
      }
    } catch (error) {
      console.error("Error generating API key:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("apiKey");
    localStorage.removeItem("userName");
    setUserName(null);
    nav("/");
  };

  return (
    <div>
      {/* Navbar - unchanged */}
      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <ul className="flex flex-row gap-x-10">
          <li>
            <button onClick={() => nav("/")} className="hover:underline">
              Document
            </button>
          </li>
          <li>
            <button
              onClick={() => setIsModalOpen(true)}
              className="hover:underline"
            >
              Generate API
            </button>
          </li>
          <li>
            <button
              onClick={() => nav("/get-data")}
              className={`hover:underline ${
                location.pathname === "/get-data" ? "underline" : ""
              }`}
            >
              Get Data
            </button>
          </li>
          <li>
            <button
              onClick={() => nav("/post-data")}
              className={`hover:underline ${
                location.pathname === "/post-data" ? "underline" : ""
              }`}
            >
              Post Data
            </button>
          </li>
          <li>
            <button
              onClick={() => nav("/update-data")}
              className="hover:underline"
            >
              Update Data
            </button>
          </li>
          <li>
            <button
              onClick={() => nav("/delete-data")}
              className="hover:underline"
            >
              Delete Data
            </button>
          </li>
        </ul>
        <div>
          {userName ? (
            <div className="flex items-center gap-4">
              <span>Hi, {userName}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => nav("/login")}
              className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* API Key Modal - unchanged */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-md">
            <h2 className="text-xl font-bold mb-4">Your API Key</h2>
            {apiKey ? (
              <p className="bg-gray-200 p-3 rounded break-words overflow-hidden">
                {apiKey}
              </p>
            ) : (
              <div>
                <p>No API Key found.</p>
                <button
                  onClick={generateApiKey}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Generate API Key
                </button>
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Student Data Form with duplicate error handling */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitError(null); // Clear previous submission errors
          const formData = new FormData(e.target);
          const yearMap = {
            first: "I",
            second: "II",
            third: "III",
            fourth: "IV",
          };

          const studentData = {
            hallTicket: formData.get("h_t_no"),
            email: formData.get("email"),
            gpa: parseFloat(formData.get("cgpa")),
            year: yearMap[formData.get("year")],
          };

          try {
            await PoststudentSchema.validate(studentData, {
              abortEarly: false,
            });
            setErrors({});

            try {
              const response = await fetch(
                `http://localhost:5000/${apiKey}/students/post${formData.get(
                  "year"
                )}-year`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "authToken"
                    )}`,
                  },
                  body: JSON.stringify(studentData),
                }
              );

              const result = await response.json();

              if (!response.ok) {
                // Handle duplicate entry error (409 status)
                if (response.status === 409) {
                  setSubmitError(result.details || result.message);
                } else {
                  setSubmitError(
                    result.message || "Failed to submit student data"
                  );
                }
              } else {
                alert(result.message);
                e.target.reset(); // Optional: Clear form after successful submission
              }
            } catch (error) {
              console.error("Error submitting student data:", error);
              setSubmitError("Failed to submit student data");
            }
          } catch (validationErrors) {
            const newErrors = {};
            validationErrors.inner.forEach((error) => {
              newErrors[error.path] = error.message;
            });
            setErrors(newErrors);
          }
        }}
        className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md mt-6"
      >
        <h2 className="text-xl font-bold mb-4">Add Student Data</h2>

        <div className="mb-4">
          <label className="block mb-2">Hall Ticket Number:</label>
          <input
            type="text"
            name="h_t_no"
            className={`w-full p-2 border rounded-md ${
              errors.hallTicket ? "border-red-500" : ""
            }`}
          />
          {errors.hallTicket && (
            <p className="text-red-500 text-sm mt-1">{errors.hallTicket}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            name="email"
            className={`w-full p-2 border rounded-md ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2">CGPA:</label>
          <input
            type="number"
            step="0.01"
            name="cgpa"
            className={`w-full p-2 border rounded-md ${
              errors.gpa ? "border-red-500" : ""
            }`}
          />
          {errors.gpa && (
            <p className="text-red-500 text-sm mt-1">{errors.gpa}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Year:</label>
          <select name="year" required className="w-full p-2 border rounded-md">
            <option value="first">First Year</option>
            <option value="second">Second Year</option>
            <option value="third">Third Year</option>
            <option value="fourth">Fourth Year</option>
          </select>
        </div>

        {/* Duplicate entry error display */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default Post_Data;
