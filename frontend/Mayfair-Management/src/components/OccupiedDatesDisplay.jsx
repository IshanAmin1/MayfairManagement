import React, { useState, useEffect, useContext } from "react";
import "./OccupiedDatesDisplay.css";
import { UserContext } from "./UserContext";

const OccupiedDatesDisplay = () => {
  const [groupedDates, setGroupedDates] = useState({});
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    console.log(user);
    if (!user) {
      return;
    }

    const baseURL = "http://127.0.0.1:8000";

    async function fetchDates() {
      try {
        const response = await fetch(`${baseURL}/occupied-dates/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Fetch failed");
        }
        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error("Error during fetching dates:", error);
        return [];
      }
    }

    async function fetchFacilityName(facilityUrl) {
      try {
        const response = await fetch(facilityUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch facility");
        }
        const data = await response.json();
        return data.name || "Unknown Facility"; // Assuming the facility object has a 'name' field
      } catch (error) {
        console.error("Error fetching facility name:", error);
        return "Unknown Facility";
      }
    }

    async function processAndSetDates() {
      const fetchedDates = await fetchDates();

      // Process dates and times into grouped ranges
      const processDates = async (dates) => {
        // Fetch facility names for all dates
        const facilityPromises = dates.map(async (entry) => ({
          ...entry,
          facilityName: await fetchFacilityName(entry.facility),
        }));
        const datesWithFacilities = await Promise.all(facilityPromises);

        // Sort dates chronologically
        const sortedDates = datesWithFacilities.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.start_time}`);
          const dateB = new Date(`${b.date}T${b.start_time}`);
          return dateA - dateB;
        });

        const ranges = {};
        let currentMonth = "";
        let currentRange = null;

        sortedDates.forEach((entry) => {
          const { date: dateStr, start_time, end_time, facilityName } = entry;
          const dateTime = new Date(`${dateStr}T${start_time}`);
          if (isNaN(dateTime.getTime())) {
            console.error("Invalid date or time:", dateStr, start_time);
            return;
          }

          const month = dateTime.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          });

          if (month !== currentMonth) {
            if (currentRange) {
              if (!ranges[currentMonth]) ranges[currentMonth] = [];
              ranges[currentMonth].push(currentRange);
            }
            currentMonth = month;
            currentRange = {
              startDate: dateStr,
              startTime: start_time,
              endDate: dateStr,
              endTime: end_time,
              facilityName, // Include facility name
            };
          } else {
            const prevDate = new Date(`${currentRange.endDate}T${currentRange.endTime}`);
            prevDate.setDate(prevDate.getDate() + 1);

            const currentDate = new Date(`${dateStr}T${start_time}`);
            if (
              currentDate.toISOString().split("T")[0] ===
              prevDate.toISOString().split("T")[0] &&
              currentRange.facilityName === facilityName // Ensure same facility
            ) {
              currentRange.endDate = dateStr;
              currentRange.endTime = end_time;
            } else {
              if (!ranges[currentMonth]) ranges[currentMonth] = [];
              ranges[currentMonth].push(currentRange);
              currentRange = {
                startDate: dateStr,
                startTime: start_time,
                endDate: dateStr,
                endTime: end_time,
                facilityName,
              };
            }
          }
        });

        if (currentRange) {
          if (!ranges[currentMonth]) ranges[currentMonth] = [];
          ranges[currentMonth].push(currentRange);
        }

        return ranges;
      };

      const processedRanges = await processDates(fetchedDates);
      setGroupedDates(processedRanges);
    }

    processAndSetDates();
  }, [user]);

  return (
    <div className="occupied-dates-container">
      {Object.keys(groupedDates).map((month) => (
        <div key={month} className="month-section">
          <h2 className="month-title">{month}</h2>
          <div className="date-cards">
            {groupedDates[month].map((range, index) => (
              <div key={index} className="date-card">
                <p className="facility-name">{range.facilityName}</p>
                <p className="date-range">
                  {new Date(`${range.startDate}T${range.startTime}`).toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} -{" "}
                  {new Date(`${range.endDate}T${range.endTime}`).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OccupiedDatesDisplay;