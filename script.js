// Supabase Configuration & Singleton Initialization
// Uses window-scoped singleton to prevent duplicate initialization errors
(function () {
    if (!window._supabaseClient) {
        const SUPABASE_URL = 'https://ddrjlkchvlbpvfsleokd.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcmpsa2NodmxicHZmc2xlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDU0MzgsImV4cCI6MjA4MjkyMTQzOH0.V-oaKw5Ejrwxg-xbtA2bof2ZPTamRkmhBECbHjWXN5U';
        window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
})();

// Get the singleton client
const supabase = window._supabaseClient;

// ==========================================
// Job Form Handler (post-job.html)
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    const jobForm = document.getElementById('jobForm');

    if (jobForm) {
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        const submitBtn = jobForm.querySelector('button[type="submit"]');

        jobForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Hide any existing messages
            successMessage.classList.remove('show');
            if (errorMessage) errorMessage.classList.remove('show');

            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting...';

            // Create job object matching Supabase table columns
            const jobData = {
                school_name: document.getElementById('schoolName').value.trim(),
                job_title: document.getElementById('jobTitle').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                job_type: document.getElementById('jobType').value,
                email: document.getElementById('contactEmail').value.trim(),
                description: document.getElementById('jobDescription').value.trim()
            };

            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .insert([jobData]);

                if (error) {
                    throw error;
                }

                // Show success message
                successMessage.classList.add('show');
                jobForm.reset();

                // Redirect to jobs page after 1.5 seconds
                setTimeout(function () {
                    window.location.href = 'jobs.html';
                }, 1500);

            } catch (error) {
                console.error('Error posting job:', error);
                if (errorMessage) {
                    errorMessage.textContent = 'Failed to post job. Please try again.';
                    errorMessage.classList.add('show');
                } else {
                    alert('Failed to post job. Please try again.');
                }
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post Job';
            }
        });
    }

    // ==========================================
    // Job Listings Handler (jobs.html)
    // ==========================================
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

    async function renderJobs(filterCity) {
        const jobListings = document.getElementById('jobListings');

        // Show loading state
        jobListings.innerHTML = '<div class="empty-state">Loading jobs...</div>';

        try {
            let query = supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply city filter if provided (case-insensitive using ilike)
            if (filterCity) {
                query = query.ilike('city', filterCity);
            }

            const { data: jobs, error } = await query;

            if (error) {
                throw error;
            }

            // Check for empty state
            if (!jobs || jobs.length === 0) {
                jobListings.innerHTML = '<div class="empty-state">No jobs posted yet</div>';
                return;
            }

            // Render job cards
            let html = '';
            jobs.forEach(function (job) {
                html += `
                    <div class="job-card">
                        <h3>${escapeHtml(job.job_title)}</h3>
                        <div class="school-name">${escapeHtml(job.school_name)}</div>
                        <div class="job-details">
                            <span><strong>Subject:</strong> ${escapeHtml(job.subject)}</span>
                            <span><strong>Location:</strong> ${escapeHtml(job.city)}, ${escapeHtml(job.state)}</span>
                        </div>
                        <div class="job-type">${escapeHtml(job.job_type)}</div>
                        <div>
                            <a href="mailto:${escapeHtml(job.email)}" class="contact-email">${escapeHtml(job.email)}</a>
                        </div>
                        <div class="job-description">${escapeHtml(job.description)}</div>
                    </div>
                `;
            });

            jobListings.innerHTML = html;

        } catch (error) {
            console.error('Error fetching jobs:', error);
            jobListings.innerHTML = '<div class="empty-state">Failed to load jobs. Please refresh the page.</div>';
        }
    }

    // Helper function to escape HTML and prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
