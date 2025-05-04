import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import FacilityCard from "./FacilityDetails/FacilityCard";
import "./BookingComponent.css";

const BookingComponent = ({ currentUser }) => {
  const [selectedDates, setSelectedDates] = useState({
    date: null,
    startTime: "09:00",
    endTime: "17:00",
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(currentUser);
  const [facilityData, setFacilityData] = useState([]);

  useEffect(() => {
    async function fetchFacilityData() {
      try {
        const headers = {
          "Content-Type": "application/json",
        };
        if (currentUser && currentUser.token) {
          headers.Authorization = `Token ${currentUser.token}`;
        }

        const response = await fetch("http://127.0.0.1:8000/facilities/", {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch facility data.");
        }

        const data = await response.json();
        console.log("Fetching successful:", data);
        setFacilityData(data);
      } catch (error) {
        console.error("Error during fetch:", error);
        setError("Failed to load facilities. Please try again.");
      }
    }
    fetchFacilityData();
  }, [currentUser]);

  const handleDateClick = (day, monthOffset = 0) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day
    );
    setSelectedDates({
      date: selectedDate,
      startTime: "09:00",
      endTime: "17:00",
    });
    setError("");
    setIsFiltered(false); // Reset filtering when date changes
  };

  const handleTimeChange = (e, type) => {
    setSelectedDates({
      ...selectedDates,
      [type]: e.target.value,
    });
    setError("");
    setIsFiltered(false); // Reset filtering when time changes
  };

  const handleMonthChange = (increment) => {
    const newDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + increment)
    );
    setCurrentDate(new Date(newDate));
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const startOfMonth = new Date(year, month, 1).getDay();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = startOfMonth - 1; i >= 0; i--) {
      days.push({ day: daysInPreviousMonth - i, monthOffset: -1 });
    }

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({ day: i, monthOffset: 0 });
    }

    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ day: i, monthOffset: 1 });
    }

    return days;
  };

  const isDateSelected = (day, monthOffset) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day
    );
    return selectedDates.date && selectedDates.date.getTime() === date.getTime();
  };

  const days = generateCalendarDays();

  const handleFilterFacilities = () => {
    if (!selectedDates.date) {
      setError("Please select a date.");
      setIsFiltered(false);
      setFilteredFacilities([]);
      return;
    }

    if (!selectedDates.startTime || !selectedDates.endTime) {
      setError("Please select start and end times.");
      setIsFiltered(false);
      setFilteredFacilities([]);
      return;
    }

    const startDateTime = new Date(selectedDates.date);
    const [startHours, startMinutes] = selectedDates.startTime.split(":");
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(selectedDates.date);
    const [endHours, endMinutes] = selectedDates.endTime.split(":");
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time.");
      setIsFiltered(false);
      setFilteredFacilities([]);
      return;
    }

    const formatDate = (date) => {
      return date.toISOString().split("T")[0]; // e.g., "2025-05-29"
    };

    const isTimeSlotAvailable = (occupiedDate, occupiedStartTime, occupiedEndTime) => {
      // Convert occupied date (e.g., "2025-05-29") to a comparable format
      const occupied = new Date(occupiedDate);
      occupied.setHours(0, 0, 0, 0);

      // Convert selected date to YYYY-MM-DD for comparison
      const selected = new Date(selectedDates.date);
      selected.setHours(0, 0, 0, 0);
      // Check if the dates match
      if (occupied.getTime() !== selected.getTime()) {
        return true; // Different day, no conflict
      }

      // Parse occupied start and end times (e.g., "09:00:00" from API)
      const occupiedStart = new Date(selectedDates.date);
      const [occStartHours, occStartMinutes, occStartSeconds = "00"] = occupiedStartTime.split(":");
      occupiedStart.setHours(occStartHours, occStartMinutes, occStartSeconds, 0);

      const occupiedEnd = new Date(selectedDates.date);
      const [occEndHours, occEndMinutes, occEndSeconds = "00"] = occupiedEndTime.split(":");
      occupiedEnd.setHours(occEndHours, occEndMinutes, occEndSeconds, 0);

      // Log for debugging
      console.log(`Checking overlap: Selected ${startDateTime} to ${endDateTime} vs Booked ${occupiedStart} to ${occupiedEnd}`);
      const isAvailable = endDateTime <= occupiedStart || startDateTime >= occupiedEnd;
      console.log(`Result: ${isAvailable ? "Available" : "Overlap"}`);
      return isAvailable;
    };

    console.log("Facility Data:", facilityData);
    // Filter facilities that have no overlapping occupied dates
    const availableFacilities = facilityData.filter((facility) =>
      facility.occupiedDates.every((occ) =>
        isTimeSlotAvailable(
          occ.date,
          occ.start_time || "00:00:00",
          occ.end_time || "23:59:59"
        )
      )
    );

    if (availableFacilities.length === 0) {
      setError("No facilities available for the selected date and time.");
      setFilteredFacilities([]);
      setIsFiltered(true);
      return;
    }

    console.log(availableFacilities)
    
    setFilteredFacilities(availableFacilities);
    setIsFiltered(true);
    setError("");
  };

  return (
    <div className="booking-container">
        {!isFiltered && (
          <div className="calendar-section">
            <div className="calendar-header">
              <button className="date-switcher" onClick={() => handleMonthChange(-1)}>
                <FaArrowLeft />
              </button>
              <h2>
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button className="date-switcher" onClick={() => handleMonthChange(1)}>
                <FaArrowRight />
              </button>
            </div>

            <div className="calendar-days">
              {days.map(({ day, monthOffset }, index) => (
                <div
                  key={index}
                  className={`calendar-day ${
                    isDateSelected(day, monthOffset) ? "selected" : ""
                  } ${monthOffset !== 0 ? "overflow" : ""}`}
                  onClick={() => handleDateClick(day, monthOffset)}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="time-selection">
              <label>
                Start Time:
                <input
                  type="time"
                  value={selectedDates.startTime}
                  onChange={(e) => handleTimeChange(e, "startTime")}
                  required
                />
              </label>
              <label>
                End Time:
                <input
                  type="time"
                  value={selectedDates.endTime}
                  onChange={(e) => handleTimeChange(e, "endTime")}
                  required
                />
              </label>
            </div>

            <button className="book-facilities-button" onClick={handleFilterFacilities}>
              Check Availability
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>
        )}
  
        <div className="filtered-facilities">
          {filteredFacilities.length > 0 ? (
            filteredFacilities.map((facility) => (
              <FacilityCard
                onBookingSuccess={() => {
                  setSelectedDates({
                    date: null,
                    startTime: "09:00",
                    endTime: "17:00",
                  });
                  setFilteredFacilities([]);
                  setSuccess("Booking Successful!");
                  setIsFiltered(false);
                  setTimeout(() => {
                    setSuccess("");
                    setError("");
                  }, 5000);
                }}
                key={facility.id}
                facility={facility}
                selectedDateRange={selectedDates}
              />
            ))
          ) : null}
        </div>

      <div className="availability-message">
      {!isFiltered && !selectedDates.date && !filteredFacilities.length && (
        <p>Please select a date and time to check availability.</p>
      )}
      {isFiltered && selectedDates.date && filteredFacilities.length === 0 && (
        <p>No available facility for the selected date and time.</p>
      )}
      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default BookingComponent;