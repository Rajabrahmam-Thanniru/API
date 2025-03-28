import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Delete_data() {
  const nav = useNavigate();
  const location = useLocation();
  const [apiKey, setApiKey] = useState(null);

  const [userName, setUserName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hallTicket, setHallTicket] = useState("");
  const [year, setYear] = useState("first-year");
  const [error, setError] = useState(null);

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

  const handleDelete = async () => {
    if (!hallTicket) {
      setError("Please enter a Hall Ticket number");
      return;
    }

    if (!apiKey) {
      setError("API Key is missing. Please login or generate an API key");
      return;
    }

    setError(null); // Clear previous errors

    try {
      const response = await fetch(
        `http://localhost:5000/students/${hallTicket}/${year}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setError("No such user found");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Failed to delete student");
        return;
      }

      alert(`Student deleted successfully: ${data.message}`);
      setHallTicket(""); // Clear input after successful deletion
    } catch (error) {
      console.error("Error deleting student:", error);
      setError("Failed to delete student. Please try again.");
    }
  };

  return (
    <div>
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

      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Delete Student</h2>

        <label className="block mb-2">Hall Ticket Number:</label>
        <input
          type="text"
          value={hallTicket}
          onChange={(e) => setHallTicket(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter Hall Ticket"
        />

        <label className="block mb-2">Select Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="first-year">First Year</option>
          <option value="second-year">Second Year</option>
          <option value="third-year">Third Year</option>
          <option value="fourth-year">Fourth Year</option>
        </select>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Delete Student
        </button>
      </div>

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
    </div>
  );
}

export default Delete_data;
