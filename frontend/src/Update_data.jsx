import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UpdateData() {
  const nav = useNavigate();
  const [apiKey, setApiKey] = useState(null);

  const [userName, setUserName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchType, setSearchType] = useState("");
  const [hallticket, setHallticket] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [error, setError] = useState(null);

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

  const handleSearchByApiKey = async () => {
    try {
      const apiKey = localStorage.getItem("apiKey");
      if (!apiKey) {
        setError("API key missing. Generate one first!");
        return;
      }

      setError(null);
      setSearchData(null);

      if (
        !searchType ||
        !year ||
        (searchType === "hallticket" && !hallticket) ||
        (searchType === "email" && !email)
      ) {
        setError("Please fill all required fields");
        return;
      }

      let endpoint;
      switch (year) {
        case "first-year":
          endpoint = "first-year";
          break;
        case "second-year":
          endpoint = "second-year";
          break;
        case "third-year":
          endpoint = "third-year";
          break;
        case "fourth-year":
          endpoint = "fourth-year";
          break;
        default:
          setError("Please select a valid year");
          return;
      }

      const queryParam =
        searchType === "hallticket"
          ? `hallticket=${hallticket}`
          : `email=${email}`;

      const response = await fetch(
        `http://localhost:5000/search/${endpoint}?${queryParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setError("Student not found");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Search failed");
        return;
      }

      setSearchData(data);
    } catch (error) {
      console.error("Search error:", error);
      setError("An error occurred during search");
    }
  };

  const handleUpdateStudent = async () => {
    try {
      if (!searchData || !searchData._id) {
        setError("No student data to update");
        return;
      }

      const apiKey = localStorage.getItem("apiKey");
      if (!apiKey) {
        setError("API key missing");
        return;
      }

      let endpoint;
      switch (year) {
        case "first-year":
          endpoint = "first-year";
          break;
        case "second-year":
          endpoint = "second-year";
          break;
        case "third-year":
          endpoint = "third-year";
          break;
        case "fourth-year":
          endpoint = "fourth-year";
          break;
        default:
          setError("Invalid year selection");
          return;
      }

      const response = await fetch(
        `http://localhost:5000/students/${searchData._id}/${endpoint}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            hallTicket: searchData.hallTicket,
            email: searchData.email,
            gpa: searchData.gpa,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Update failed");
        return;
      }

      alert("Student updated successfully!");
      setError(null);
    } catch (error) {
      console.error("Update error:", error);
      setError("Failed to update student");
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

      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md mt-10">
        <h2 className="text-xl font-bold mb-4">Update Student Data</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search by:
          </label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select search type</option>
            <option value="hallticket">Hall Ticket Number</option>
            <option value="email">Email</option>
          </select>
        </div>

        {searchType === "hallticket" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hall Ticket Number:
            </label>
            <input
              type="text"
              value={hallticket}
              onChange={(e) => setHallticket(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="2103A112345"
            />
          </div>
        )}

        {searchType === "email" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="student@example.com"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year:
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select year</option>
            <option value="first-year">First Year</option>
            <option value="second-year">Second Year</option>
            <option value="third-year">Third Year</option>
            <option value="fourth-year">Fourth Year</option>
          </select>
        </div>

        <button
          onClick={handleSearchByApiKey}
          disabled={
            !searchType ||
            !year ||
            (searchType === "hallticket" && !hallticket) ||
            (searchType === "email" && !email)
          }
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
        >
          Search Student
        </button>

        {searchData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="font-medium mb-3">Edit Student Details</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hall Ticket:
              </label>
              <input
                type="text"
                value={searchData.hallTicket || ""}
                onChange={(e) =>
                  setSearchData({ ...searchData, hallTicket: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email:
              </label>
              <input
                type="email"
                value={searchData.email || ""}
                onChange={(e) =>
                  setSearchData({ ...searchData, email: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA:
              </label>
              <input
                type="number"
                value={searchData.gpa || ""}
                onChange={(e) =>
                  setSearchData({ ...searchData, gpa: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                step="0.01"
                min="0"
                max="10"
              />
            </div>

            <button
              type="button"
              onClick={handleUpdateStudent}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update Student
            </button>
          </div>
        )}
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

export default UpdateData;
