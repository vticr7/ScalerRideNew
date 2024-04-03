document.addEventListener("DOMContentLoaded", function () {
  const bookCabBtn = document.querySelector("#book-cab-btn");
  const nameInput = document.querySelector("#name");
  const emailInput = document.querySelector("#email");
  const sourceInput = document.querySelector("#source");
  const destinationInput = document.querySelector("#destination");
  const carModelSelect = document.querySelector("#car-model");
  const errorMessage = document.querySelector("#error-message");
  const bookingForm = document.querySelector("#booking-form");
  const bookingConfirmation = document.querySelector(".booking-confirmation");
  const viewPricesBtn = document.querySelector("#view-prices-btn");
  const cabsContainer = document.querySelector(".cabs-prices-container");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  bookCabBtn.addEventListener("click", async () => {
    errorMessage.textContent = ""; // Clear previous error message
    if (!emailRegex.test(emailInput.value)) {
      errorMessage.textContent = "Please enter a valid email address.";
      return;
    }

    const bookingDetails = {
      source: sourceInput.value,
      destination: destinationInput.value,
      carModelId: parseInt(carModelSelect.value, 10),
      userId: 123 // Replace with actual user ID in a real application
    };

    try {
      const response = await fetch('https://a1milzetk6.execute-api.ap-south-1.amazonaws.com/dev/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingDetails)
      });

      if (!response.ok) throw new Error('Failed to book cab.');

      const responseData = await response.json();
      const { message, path, distance, cost } = responseData; // Assuming API response directly gives an object

      bookingConfirmation.innerHTML = `Thank you, ${nameInput.value}. ${message}
    <br>The shortest path is: ${path.join(" ➔ ")}.
    <br>Distance: ${distance} km.
    <br>Cost: Rs ${cost}.
    <br>A booking confirmation email has been sent to ${emailInput.value}.
    <br>Your booking has been saved in the database.`;
      bookingForm.style.display = "none";
      bookingConfirmation.style.display = "block";
      cabsContainer.style.display = "none";
    } catch (error) {
      console.error('Booking error:', error);
      errorMessage.textContent = "Error booking cab. Please try again.";
    }
  });

  viewPricesBtn.addEventListener("click", fetchCabsDetails);

  async function fetchCabsDetails() {
    try {
      const response = await fetch('https://a1milzetk6.execute-api.ap-south-1.amazonaws.com/dev/cabs');
      if (!response.ok) throw new Error('Failed to fetch cab details.');

      const cabs = await response.json();
      displayCabsDetails(cabs);
    } catch (error) {
      console.error('Fetch cab details error:', error);
      errorMessage.textContent = "Error fetching cab details. Please try again.";
    }
  }

  function displayCabsDetails(cabs) {
    let htmlContent = "<table><thead><tr><th>Cab Type</th><th>Price/Minute</th><th>Action</th></tr></thead><tbody>";
    cabs.forEach(cab => {
      htmlContent += `<tr><td>${cab.Model}</td><td>${cab.PricingPerMinute}</td><td><button onclick="editPrice(${cab.CabID})">Edit</button></td></tr>`;
    });
    htmlContent += "</tbody></table>";
    cabsContainer.innerHTML = htmlContent;
    cabsContainer.style.display = "block";
  }

  window.editPrice = async function (cabId) {
    const newPrice = prompt("Enter the new price per minute for the cab:");
    if (!newPrice) return;

    try {
      const response = await fetch(`https://a1milzetk6.execute-api.ap-south-1.amazonaws.com/dev/cabs/${cabId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: newPrice }),
      });

      if (!response.ok) throw new Error('Failed to update price.');

      alert("Price updated successfully.");
      fetchCabsDetails(); // Refresh to show updated prices
    } catch (error) {
      console.error('Error updating price:', error);
      alert("Error updating price. Please try again.");
    }
  };
});
