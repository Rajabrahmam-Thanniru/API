import React, { useState, useEffect } from "react";
import axios from "axios";

const GenerateAPI = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/get-api-key", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setApiKey(response.data.apiKey);
      } catch (err) {
        console.error("Error fetching API key:", err);
        setError("Error fetching API key");
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  const generateApiKey = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "/generate-api-key",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setApiKey(response.data.apiKey);
    } catch (err) {
      console.error("Error generating API key:", err);
      setError("Error generating API key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setShowPopup(true)}
      >
        Generate API
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-96">
            <h1 className="text-2xl font-bold mb-4">Generate API Key</h1>

            {loading && <p className="text-blue-500">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {apiKey ? (
              <div className="mt-4">
                <p className="text-gray-700 mb-4">
                  <strong>Your API Key: </strong>
                  <span className="break-all">{apiKey}</span>
                </p>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => setShowPopup(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-gray-700 mb-4">
                  No API key found. Click below to generate one:
                </p>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={generateApiKey}
                >
                  Generate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateAPI;
