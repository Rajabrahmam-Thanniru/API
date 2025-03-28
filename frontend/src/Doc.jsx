import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Doc() {
  const nav = useNavigate();
  const [apiKey, setApiKey] = useState(null);

  const [userName, setUserName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("gettingStarted");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    const storedUser = localStorage.getItem("userName");

    if (storedUser) setUserName(storedUser);
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
    <div className="min-h-screen bg-gray-50">
      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <ul className="flex flex-row gap-x-10">
          <li>
            <button
              onClick={() => setActiveTab("gettingStarted")}
              className="hover:underline"
            >
              Documentation
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                if (userName) {
                  setIsModalOpen(true);
                } else {
                  nav("/login");
                }
              }}
              className="hover:underline"
            >
              API Key
            </button>
          </li>

          <li>
            <button
              onClick={() => nav("/get-data")}
              className="hover:underline"
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
              <span>Welcome, {userName}</span>
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

      <div className="container mx-auto p-6">
        {activeTab === "gettingStarted" && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6">
              Student Management API Documentation
            </h1>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold mb-2">1. Authentication</h3>
                  <p>Before using the API, you need to:</p>
                  <ol className="list-decimal pl-6 mt-2 space-y-2">
                    <li>
                      Register an account at <code>/register</code>
                    </li>
                    <li>
                      Login to obtain your JWT token at <code>/login</code>
                    </li>
                    <li>Generate your API key using the button above</li>
                  </ol>
                </div>

                {/* Replaced "Using Your API Key" with "Get Data" section */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold mb-2">2. Get Data Endpoints</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">All Students</h4>
                      <pre className="bg-gray-800 text-white p-3 rounded mt-2 overflow-x-auto">
                        GET /:apiKey/allstudents
                      </pre>
                      <p className="mt-1 text-sm">
                        Retrieves all students across all years
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold">By Academic Year</h4>
                      <pre className="bg-gray-800 text-white p-3 rounded mt-2 overflow-x-auto">
                        GET /:apiKey/students/[year]
                      </pre>
                      <p className="mt-1 text-sm">
                        Where [year] can be: first-year, second-year,
                        third-year, or fourth-year
                      </p>
                    </div>

                    <div className="mt-2">
                      <h4 className="font-semibold">Example Response</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm">
                        {`[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k",
    "hallTicket": "21ABC12345",
    "email": "student@example.com",
    "gpa": 8.5,
    "year": "First Year"
  }
]`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>

              <div className="space-y-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-800 text-white p-3 font-mono">
                    GET /:apiKey/students/[year]
                  </div>
                  <div className="p-4">
                    <p>Retrieve student data by academic year (1-4).</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Example: <code>GET /:apiKey/students/first-year</code>
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-800 text-white p-3 font-mono">
                    PATCH /students/:studentId/[year]
                  </div>
                  <div className="p-4">
                    <p>
                      Update student information (partial updates supported).
                    </p>
                    <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
                      {`{
  "email": "new.email@example.com",
  "gpa": 3.8
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-800 text-white p-3 font-mono">
                    DELETE /students/:hallTicket/[year]
                  </div>
                  <div className="p-4">
                    <p>Remove a student record by hall ticket number.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Always store your API key securely</li>
                <li>Use HTTPS for all requests in production</li>
                <li>Implement error handling in your client applications</li>
                <li>Rate limit your requests to avoid being blocked</li>
              </ul>
            </section>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">API Key Management</h2>
            {apiKey ? (
              <div>
                <p className="mb-2">Your current API key:</p>
                <div className="bg-gray-200 p-3 rounded break-words mb-4">
                  {apiKey}
                </div>
                <p className="text-sm text-red-600 mb-4">
                  Warning: This key provides full access to your account. Keep
                  it secure.
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-4">No API key generated yet.</p>
                <button
                  onClick={generateApiKey}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Generate New API Key
                </button>
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doc;
