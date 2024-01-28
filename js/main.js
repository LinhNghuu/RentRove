let page = 1;
const perPage = 10;
let searchName = null;

function loadListingsData() {
  let url = `/api/listings?page=${page}&perPage=${perPage}`;
  if (searchName) {
    url += `&name=${encodeURIComponent(searchName)}`;
  }

  fetch(url)
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data) => {
      const tbody = document.querySelector('#listingsTable tbody');
      tbody.innerHTML = '';

      if (data.length > 0) {
        data.forEach((listing) => {
          const row = document.createElement('tr');
          row.setAttribute('data-id', listing._id);
          row.innerHTML = `
              <td>${listing.name}</td>
              <td>${listing.room_type}</td>
              <td>${listing.address.street}</td>
              <td>${listing.summary || ''}<br><strong>Accommodates:</strong> ${
            listing.accommodates
          }<br><strong>Rating:</strong> ${
            listing.review_scores.review_scores_rating
          } (${listing.number_of_reviews} Reviews)</td>
            `;
          tbody.appendChild(row);
        });
        addRowClickEvents();
        document.getElementById('current-page').textContent = page;
      } else {
        tbody.innerHTML =
          '<tr><td colspan="4"><strong>No data available</strong></td></tr>';
      }
    })
    .catch((err) => {
      console.error('Fetch error:', err);
      const tbody = document.querySelector('#listingsTable tbody');
      tbody.innerHTML =
        '<tr><td colspan="4"><strong>Error loading data</strong></td></tr>';
    });
}

function addRowClickEvents() {
  document.querySelectorAll('#listingsTable tbody tr').forEach((row) => {
    row.addEventListener('click', () => {
      const listingId = row.getAttribute('data-id');
      fetch(`/api/listings/${listingId}`)
        .then((response) => response.json())
        .then((listingDetails) => {
          document.querySelector('#detailsModalLabel').textContent =
            listingDetails.name;
          document.querySelector('#detailsModal .modal-body').innerHTML = `
            <img src="${
              listingDetails.images.picture_url
            }" class="img-fluid w-100" onerror="this.src='https://placehold.co/600x400?text=Photo+Not+Available'">
            <p>${listingDetails.summary}</p>
            <strong>Price:</strong> $${listingDetails.price.toFixed(2)}<br>
            <strong>Room Type:</strong> ${listingDetails.room_type}<br>
            <strong>Bed Type:</strong> ${listingDetails.bed_type}<br>
            <strong>Accommodates:</strong> ${listingDetails.accommodates}<br>
          `;
          new bootstrap.Modal(document.getElementById('detailsModal')).show();
        })
        .catch((err) => console.error('Error fetching listing details:', err));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadListingsData();

  document.getElementById('previous-page').addEventListener('click', () => {
    if (page > 1) {
      page--;
      loadListingsData();
    }
  });

  document.getElementById('next-page').addEventListener('click', () => {
    const currentListings = document.querySelectorAll('#listingsTable tbody tr').length;
    if (currentListings === perPage) {
      page++;
      loadListingsData();
    }
  });
  

  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      searchName = document.getElementById('name').value;
      page = 1;
      loadListingsData();
    });
  }

  document.getElementById('clearForm').addEventListener('click', () => {
    document.getElementById('name').value = '';
    searchName = null;
    page = 1;
    loadListingsData();
  });
});
