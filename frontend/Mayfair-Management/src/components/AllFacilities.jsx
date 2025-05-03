import React from "react";
import "./AllFacilities.css";
import FacilityCard from "./FacilityDetails/FacilityCard";
import { useState, useEffect } from "react";
const AllFacilities = () => {
  const [facilityData, setFacilityData] = useState([]);

  useEffect(() => {
    async function fetchFacilityData() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/facilities/",
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch facility data.");
        }

        const data = await response.json();
        console.log("Fetching successful:", data);  
        setFacilityData(data);
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    }
    fetchFacilityData();
  }, []);
  return (
    <div className="all-facilities-container">
      <h2>All Facilities</h2>
      <div className="facilities-list">
        {facilityData.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </div>
    </div>
  );
};

export default AllFacilities;