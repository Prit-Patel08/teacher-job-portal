// Job Form Handler
document.addEventListener('DOMContentLoaded', function () {
    const jobForm = document.getElementById('jobForm');

    if (jobForm) {
        jobForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Create job object from form data
            const job = {
                id: Date.now(),
                schoolName: document.getElementById('schoolName').value,
                jobTitle: document.getElementById('jobTitle').value,
                subject: document.getElementById('subject').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                jobType: document.getElementById('jobType').value,
                contactEmail: document.getElementById('contactEmail').value,
                jobDescription: document.getElementById('jobDescription').value,
                postedAt: new Date().toISOString()
            };

            // Get existing jobs from localStorage or initialize empty array
            let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

            // Add new job to array
            jobs.push(job);

            // Save back to localStorage
            localStorage.setItem('jobs', JSON.stringify(jobs));

            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.classList.add('show');

            // Reset form
            jobForm.reset();

            // Hide success message after 3 seconds
            setTimeout(function () {
                successMessage.classList.remove('show');
            }, 3000);
        });
    }

    // Job Listings Handler
    const jobListings = document.getElementById('jobListings');
    const filterBtn = document.getElementById('filterBtn');
    const cityFilter = document.getElementById('cityFilter');

    if (jobListings) {
        // Initial render of all jobs
        renderJobs();

        // Filter button click handler
        filterBtn.addEventListener('click', function () {
            renderJobs(cityFilter.value.trim());
        });

        // Also filter on Enter key
        cityFilter.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                renderJobs(cityFilter.value.trim());
            }
        });
    }

    function renderJobs(filterCity) {
        const jobListings = document.getElementById('jobListings');
        let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

        // Filter by city if provided
        if (filterCity) {
            jobs = jobs.filter(function (job) {
                return job.city.toLowerCase() === filterCity.toLowerCase();
            });
        }

        // Check for empty state
        if (jobs.length === 0) {
            jobListings.innerHTML = '<div class="empty-state">No jobs posted yet</div>';
            return;
        }

        // Render job cards
        let html = '';
        jobs.forEach(function (job) {
            html += `
                <div class="job-card">
                    <h3>${escapeHtml(job.jobTitle)}</h3>
                    <div class="school-name">${escapeHtml(job.schoolName)}</div>
                    <div class="job-details">
                        <span><strong>Subject:</strong> ${escapeHtml(job.subject)}</span>
                        <span><strong>Location:</strong> ${escapeHtml(job.city)}, ${escapeHtml(job.state)}</span>
                    </div>
                    <div class="job-type">${escapeHtml(job.jobType)}</div>
                    <div>
                        <a href="mailto:${escapeHtml(job.contactEmail)}" class="contact-email">${escapeHtml(job.contactEmail)}</a>
                    </div>
                    <div class="job-description">${escapeHtml(job.jobDescription)}</div>
                </div>
            `;
        });

        jobListings.innerHTML = html;
    }

    // Helper function to escape HTML and prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
