import React, { useContext } from "react";
import FacilityImageSlider from "./FacilityImageSlider";
import FacilityInfo from "./FacilityInfo";
import "./FacilityDetails.css";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

const FacilityCard = ({ facility, selectedDateRange, onBookingSuccess }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleBooking = async (facilityId, userId, selectedDateRange) => {
    if (!user) {
      return navigate("/auth");
    }

    const { date, startTime, endTime } = selectedDateRange;
    if (!date || !startTime || !endTime) {
      console.error("Missing date or time information");
      return;
    }

    const baseURL = "http://127.0.0.1:8000";
    const facilityUrl = `${baseURL}/facilities/${facilityId}/`;
    const userUrl = `${baseURL}/users/${userId}/`;

    // Format the date as YYYY-MM-DD from "2025-05-29T00:00:00Z"
    const formattedDate = new Date(date).toISOString().split("T")[0]; // e.g., "2025-05-29"

    try {
      const response = await fetch(`${baseURL}/occupied-dates/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${user.token}`,
        },
        body: JSON.stringify({
          facility: facilityUrl,
          user: userUrl,
          date: formattedDate,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      const data = await response.json();
      onBookingSuccess();
      console.log("Booking successful:", data);
    } catch (error) {
      console.error("Error during booking:", error);
      alert("An error occurred during booking. Please try again.");
    }
  };

  return (
    <div className="facility-card">
      <FacilityImageSlider images={facility.images} />
      <FacilityInfo facility={facility} />
      {selectedDateRange && selectedDateRange.date ? (
        <button
          className="book-facility-button"
          onClick={() =>
            handleBooking(facility.id, user?.user?.id, selectedDateRange)
          }
          disabled={!selectedDateRange.date || !selectedDateRange.startTime || !selectedDateRange.endTime}
        >
          Book Facility
        </button>
      ) : null}
    </div>
  );
};

export default FacilityCard;