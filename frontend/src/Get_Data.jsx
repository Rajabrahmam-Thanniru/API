import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Get_Data() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    const storedUser = localStorage.getItem("userName");

    if (storedUser) setUserName(storedUser);

    if (storedApiKey) {
      setApiKey(storedApiKey);
      setLoading(false);
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
    setLoading(false);
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
  // const apiKey = localStorage.getItem("apiKey");

  const fetchStudents = async (endpoint) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/${apiKey}${endpoint}`
      );
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
    setLoading(false);
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
      {/* Navigation Bar */}
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
              className="hover:underline"
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

      {/* Year Selection Buttons */}
      <div className="flex justify-center gap-4 p-4">
        <button
          onClick={() => fetchStudents("/allstudents")}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          All Students
        </button>
        <button
          onClick={() => fetchStudents("/students/first-year")}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          First Year
        </button>
        <button
          onClick={() => fetchStudents("/students/second-year")}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Second Year
        </button>
        <button
          onClick={() => fetchStudents("/students/third-year")}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Third Year
        </button>
        <button
          onClick={() => fetchStudents("/students/fourth-year")}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Fourth Year
        </button>
      </div>

      {/* Student List */}
      {loading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {students.map((student, index) => (
            <div
              key={index}
              className="border p-4 rounded-lg shadow-md bg-white"
            >
              <h3 className="font-bold">Hall Ticket: {student.hallTicket}</h3>
              <p>Email: {student.email}</p>
              <p>GPA: {student.gpa}</p>
              <p>Year: {student.year}</p>
            </div>
          ))}
        </div>
      )}

      {/* API Key Modal */}
      {isModalOpen && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-lg w-96 max-w-md z-50">
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
      )}
    </div>
  );
}

export default Get_Data;
