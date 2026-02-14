/**
 * Dashboard Logic
 * Handles dynamic module loading, data management (CRUD), and UI updates.
 */

// State
let currentUser = null;
let currentModule = 'overview';

// Mock Data (Seed data for first run)
const seedData = {
    crops: [
        { id: 1, name: "Wheat", season: "Rabi", sowingDate: "2023-11-15", harvestDate: "2024-04-10", fertilizer: "DAP, Urea" },
        { id: 2, name: "Rice", season: "Kharif", sowingDate: "2023-06-20", harvestDate: "2023-10-25", fertilizer: "NPK" }
    ],
    ideas: [
        { id: 1, title: "Drip Irrigation Hack", description: "Use old bottles for drip irrigation in small gardens.", category: "Water Saving", author: "Rajesh Kumar" }
    ],
    queries: [
        { id: 1, title: "Yellow leaves in Wheat", status: "Resolved", date: "2023-12-01", response: "It might be nitrogen deficiency. Apply Urea." }
    ],
    products: [
        { id: 1, name: "Organic Potatoes", quantity: "500 kg", price: "20/kg", seller: "Rajesh Kumar" }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    currentUser = checkAuth();
    if (!currentUser) return; // Redirect handled in checkAuth

    // UI Setup
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();

    // Mobile Sidebar
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    if (openBtn) openBtn.addEventListener('click', () => sidebar.classList.add('active'));
    if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));

    // Initialize Data if empty
    if (!localStorage.getItem('krishi_crops')) localStorage.setItem('krishi_crops', JSON.stringify(seedData.crops));
    if (!localStorage.getItem('krishi_queries')) localStorage.setItem('krishi_queries', JSON.stringify(seedData.queries));
    if (!localStorage.getItem('krishi_ideas')) localStorage.setItem('krishi_ideas', JSON.stringify(seedData.ideas));
    if (!localStorage.getItem('krishi_products')) localStorage.setItem('krishi_products', JSON.stringify(seedData.products));

    // Admin Sidebar Link Injection
    if (currentUser.email.includes('admin') || currentUser.userType === 'admin') {
        const navMenu = document.querySelector('.nav-menu');
        const adminLink = document.createElement('div');
        adminLink.className = 'nav-link';
        adminLink.innerHTML = '<span>🛡️</span> Admin Panel';
        adminLink.onclick = () => loadModule('admin');
        navMenu.appendChild(adminLink);
    }

    // Load Default Module
    loadModule('overview');
});


/* ============================
   Module Loader
   ============================ */
function loadModule(moduleName) {
    currentModule = moduleName;
    const contentArea = document.getElementById('contentArea');
    const headerTitle = document.getElementById('headerTitle');

    // Update Sidebar Active State
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.innerHTML.includes(getModuleIcon(moduleName))) link.classList.add('active');
        if (moduleName === 'admin' && link.innerText.includes('Admin')) link.classList.add('active');
    });

    headerTitle.textContent = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

    // Close sidebar on mobile when link clicked
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }

    // Render Content
    contentArea.innerHTML = '<div class="loader" style="text-align: center; margin-top: 5rem;">Loading...</div>'; // Simple Loader

    setTimeout(() => { // Simulate slight delay for realism
        switch (moduleName) {
            case 'overview': renderOverview(contentArea); break;
            case 'crops': renderCrops(contentArea); break;
            case 'market': renderMarket(contentArea); break;
            case 'queries': renderQueries(contentArea); break;
            case 'ideas': renderIdeas(contentArea); break;
            case 'schemes': renderSchemes(contentArea); break;
            case 'admin': renderAdmin(contentArea); break;
            default: contentArea.innerHTML = '<p>Module not found.</p>';
        }
    }, 300);
}

function getModuleIcon(name) {
    const icons = { 'overview': '📊', 'crops': '🌾', 'market': '🛒', 'queries': '💬', 'ideas': '💡', 'schemes': '📜', 'admin': '🛡️' };
    return icons[name] || '';
}

/* ============================
   1. Overview Module
   ============================ */
function renderOverview(container) {
    const crops = JSON.parse(localStorage.getItem('krishi_crops') || '[]');
    const queries = JSON.parse(localStorage.getItem('krishi_queries') || '[]');

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon bg-green-light">🌾</div>
                <div>
                    <h3 style="font-size: 2rem; font-weight: 700; color: var(--primary);">${crops.length}</h3>
                    <p style="color: var(--text-muted);">Active Crops</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-blue-light">💬</div>
                <div>
                    <h3 style="font-size: 2rem; font-weight: 700; color: #1976D2;">${queries.length}</h3>
                    <p style="color: var(--text-muted);">Pending Queries</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-orange-light">⛅</div>
                <div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #F57C00;">24°C</h3>
                    <p style="color: var(--text-muted);">New Delhi, IN</p>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <!-- Recent Activity -->
            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
                    <h3 style="margin: 0;">Recent Activity</h3>
                    <span class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="loadModule('queries')">View All</span>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="display: flex; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                        <div style="background: #E3F2FD; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">📢</div>
                        <div>
                            <p style="font-weight: 600;">System Update</p>
                            <p style="font-size: 0.9rem; color: var(--text-muted);">New PM-Kisan scheme details added. Check Schemes section.</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem; padding-top: 1rem;">
                        <div style="background: #E8F5E9; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">✅</div>
                        <div>
                            <p style="font-weight: 600;">Query Resolved</p>
                            <p style="font-size: 0.9rem; color: var(--text-muted);">Expert replied to "Fungal infection in rice".</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Yield Chart -->
            <div class="card">
                <h3>Yield Forecast</h3>
                <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1rem;">Projected vs Actual (Qt/Acre)</p>
                <canvas id="yieldChart" style="width: 100%; height: 200px;"></canvas>
            </div>
        </div>
    `;

    setTimeout(drawYieldChart, 100);
}

function drawYieldChart() {
    const canvas = document.getElementById('yieldChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize handling
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 200;

    const data = [12, 19, 15, 25, 22, 30];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const barWidth = 30;
    const gap = (canvas.width - (data.length * barWidth)) / (data.length + 1);
    const maxVal = Math.max(...data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach((val, i) => {
        const x = gap + i * (barWidth + gap);
        const height = (val / maxVal) * (canvas.height - 40);
        const y = canvas.height - height - 20;

        // Draw Bar
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#81C784');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);

        // Draw Label
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barWidth / 2, canvas.height - 5);
    });
}

/* ============================
   2. Crop Management Module
   ============================ */
function renderCrops(container) {
    const crops = JSON.parse(localStorage.getItem('krishi_crops') || '[]');

    let html = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
            <p style="color: var(--text-muted);">Manage your farming activities and crop cycles.</p>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary" onclick="exportCropsCSV()">⬇ Export CSV</button>
                <button class="btn btn-primary" onclick="showAddCropModal()">+ Add New Crop</button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr><th>Crop Name</th><th>Season</th><th>Sowing Date</th><th>Harv. Date</th><th>Action</th></tr>
                </thead>
                <tbody>
    `;

    if (crops.length === 0) {
        html += `<tr><td colspan="5" style="text-align: center; padding: 2rem;">No crops added yet.</td></tr>`;
    } else {
        crops.forEach(crop => {
            html += `
                <tr>
                    <td style="font-weight: 500;">${crop.name}</td>
                    <td><span style="background: #E8F5E9; color: var(--primary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">${crop.season}</span></td>
                    <td>${crop.sowingDate}</td>
                    <td>${crop.harvestDate}</td>
                    <td><button class="btn" style="color: var(--danger); padding: 0.25rem;" onclick="deleteCrop(${crop.id})">🗑️</button></td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div>`;
    html += getCropModalHTML();

    container.innerHTML = html;
    attachCropFormListener(container);
}

function exportCropsCSV() {
    const crops = JSON.parse(localStorage.getItem('krishi_crops') || '[]');
    if (crops.length === 0) return alert('No data to export!');

    const headers = ['ID,Name,Season,SowingDate,HarvestDate'];
    const rows = crops.map(c => `${c.id},${c.name},${c.season},${c.sowingDate},${c.harvestDate}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_crops.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getCropModalHTML() {
    return `
        <div id="cropModal" style="display:none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000;">
            <div class="card animate-fade-in" style="width: 90%; max-width: 500px;">
                <h3 style="margin-bottom: 1rem;">Add New Crop</h3>
                <form id="addCropForm">
                    <div class="form-group"><label class="form-label">Crop Name</label><input type="text" id="c_name" class="form-control" required></div>
                    <div class="form-group"><label class="form-label">Season</label>
                        <select id="c_season" class="form-control"><option>Kharif</option><option>Rabi</option><option>Zaid</option></select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group"><label class="form-label">Sowing Date</label><input type="date" id="c_sow" class="form-control" required></div>
                        <div class="form-group"><label class="form-label">Harvest Date</label><input type="date" id="c_harv" class="form-control" required></div>
                    </div>
                    <div style="text-align: right; margin-top: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('cropModal').style.display='none'">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Crop</button>
                    </div>
                </form>
            </div>
        </div>`;
}

function attachCropFormListener(container) {
    const form = document.getElementById('addCropForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newCrop = {
                id: Date.now(),
                name: document.getElementById('c_name').value,
                season: document.getElementById('c_season').value,
                sowingDate: document.getElementById('c_sow').value,
                harvestDate: document.getElementById('c_harv').value
            };
            const currentCrops = JSON.parse(localStorage.getItem('krishi_crops') || '[]');
            currentCrops.push(newCrop);
            localStorage.setItem('krishi_crops', JSON.stringify(currentCrops));
            document.getElementById('cropModal').style.display = 'none';
            renderCrops(container);
        });
    }
}
function showAddCropModal() { document.getElementById('cropModal').style.display = 'flex'; }
function deleteCrop(id) {
    if (confirm('Remove this crop?')) {
        let crops = JSON.parse(localStorage.getItem('krishi_crops') || '[]');
        crops = crops.filter(c => c.id !== id);
        localStorage.setItem('krishi_crops', JSON.stringify(crops));
        renderCrops(document.getElementById('contentArea'));
    }
}

/* ============================
   3. Queries Module
   ============================ */
function renderQueries(container) {
    const queries = JSON.parse(localStorage.getItem('krishi_queries') || '[]');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div><h3>Ask an Expert</h3><p style="color: var(--text-muted);">Get solutions for pests, diseases, etc.</p></div>
            <button class="btn btn-primary" onclick="showQueryModal()">+ Ask Question</button>
        </div>
        <div style="display: grid; gap: 1rem;">
            ${queries.map(q => `
                <div class="card" style="border-left: 4px solid ${q.status === 'Resolved' ? 'var(--success)' : 'var(--warning)'};">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0;">${q.title}</h4>
                        <span style="font-size: 0.8rem; background: ${q.status === 'Resolved' ? '#DCFCE7' : '#FEF3C7'}; color: ${q.status === 'Resolved' ? '#166534' : '#B45309'}; padding: 2px 8px; border-radius: 4px;">${q.status}</span>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">${q.date || 'Today'}</p>
                    ${q.response ? `<div style="background: var(--bg-body); padding: 1rem; border-radius: var(--radius-md); font-size: 0.9rem;"><strong style="color: var(--primary);">Expert Answer:</strong> ${q.response}</div>` : ''}
                </div>
            `).join('')}
            ${queries.length === 0 ? '<p>No queries yet.</p>' : ''}
        </div>
        ${getQueryModalHTML()}
    `;
    attachQueryFormListener(container);
}

function getQueryModalHTML() {
    return `<div id="queryModal" style="display:none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000;">
            <div class="card animate-fade-in" style="width: 90%; max-width: 500px;">
                <h3>Raise a Query</h3>
                <form id="addQueryForm">
                    <div class="form-group"><label class="form-label">Subject</label><input type="text" id="q_title" class="form-control" required placeholder="e.g. Yellow spots on leaves"></div>
                    <div class="form-group"><label class="form-label">Description</label><textarea id="q_desc" class="form-control" rows="4" required placeholder="Describe the issue..."></textarea></div>
                    <div style="text-align: right; margin-top: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('queryModal').style.display='none'">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                </form>
            </div>
        </div>`;
}

function attachQueryFormListener(container) {
    const form = document.getElementById('addQueryForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newQ = {
                id: Date.now(),
                title: document.getElementById('q_title').value,
                status: "Pending",
                date: new Date().toLocaleDateString()
            };
            const qs = JSON.parse(localStorage.getItem('krishi_queries') || '[]');
            qs.unshift(newQ);
            localStorage.setItem('krishi_queries', JSON.stringify(qs));

            // Auto-respond simulation
            setTimeout(() => {
                const updatedQs = JSON.parse(localStorage.getItem('krishi_queries'));
                if (updatedQs.length > 0 && updatedQs[0].id === newQ.id) {
                    updatedQs[0].status = "Resolved";
                    updatedQs[0].response = "Thank you for your query. Our AI suggests using Neem Oil spray (5ml/liter).";
                    localStorage.setItem('krishi_queries', JSON.stringify(updatedQs));
                    if (currentModule === 'queries') renderQueries(container);
                }
            }, 3000);

            document.getElementById('queryModal').style.display = 'none';
            renderQueries(container);
        });
    }
}
function showQueryModal() { document.getElementById('queryModal').style.display = 'flex'; }


/* ============================
   4. Idea Submission Module
   ============================ */
function renderIdeas(container) {
    const ideas = JSON.parse(localStorage.getItem('krishi_ideas') || '[]');
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div><h3>Innovation Corner</h3><p style="color: var(--text-muted);">Share farming tips and innovative ideas.</p></div>
            <button class="btn btn-primary" onclick="showIdeaModal()">+ Submit Idea</button>
        </div>
        <div class="features-grid">
            ${ideas.length === 0 ? '<p>No ideas submitted yet.</p>' : ideas.map(idea => `
                <div class="card">
                    <div style="font-size: 0.8rem; color: var(--primary); text-transform: uppercase; font-weight: bold; margin-bottom: 0.5rem;">${idea.category}</div>
                    <h3 style="margin-bottom: 0.5rem;">${idea.title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">${idea.description}</p>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: var(--text-muted);">
                        Submitted by: ${idea.author}
                    </div>
                </div>
            `).join('')}
        </div>
        ${getIdeaModalHTML()}
    `;
    attachIdeaFormListener(container);
}

function getIdeaModalHTML() {
    return `<div id="ideaModal" style="display:none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000;">
            <div class="card animate-fade-in" style="width: 90%; max-width: 500px;">
                <h3>Submit an Idea</h3>
                <form id="addIdeaForm">
                    <div class="form-group"><label class="form-label">Title</label><input type="text" id="i_title" class="form-control" required></div>
                    <div class="form-group"><label class="form-label">Category</label>
                        <select id="i_cat" class="form-control"><option>Water Saving</option><option>Pest Control</option><option>Equipment</option><option>Organic Farming</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Description</label><textarea id="i_desc" class="form-control" rows="3" required></textarea></div>
                    <div style="text-align: right; margin-top: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('ideaModal').style.display='none'">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit Idea</button>
                    </div>
                </form>
            </div>
        </div>`;
}

function attachIdeaFormListener(container) {
    const form = document.getElementById('addIdeaForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newIdea = {
                id: Date.now(),
                title: document.getElementById('i_title').value,
                category: document.getElementById('i_cat').value,
                description: document.getElementById('i_desc').value,
                author: currentUser.name
            };
            const ideas = JSON.parse(localStorage.getItem('krishi_ideas') || '[]');
            ideas.push(newIdea);
            localStorage.setItem('krishi_ideas', JSON.stringify(ideas));
            document.getElementById('ideaModal').style.display = 'none';
            renderIdeas(container);
        });
    }
}
function showIdeaModal() { document.getElementById('ideaModal').style.display = 'flex'; }


/* ============================
   5. Direct Marketing Module
   ============================ */
function renderMarket(container) {
    const products = JSON.parse(localStorage.getItem('krishi_products') || '[]');
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div><h3>Direct Marketing</h3><p style="color: var(--text-muted);">Sell your produce directly to buyers.</p></div>
            <button class="btn btn-primary" onclick="showProductModal()">+ List New Produce</button>
        </div>
        <div class="features-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
            ${products.map(p => `
                <div class="card">
                    <div style="height: 120px; background: #eee; border-radius: var(--radius-md); margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem;">🥔</div>
                    <h4>${p.name}</h4>
                    <p style="color: var(--primary); font-weight: bold;">₹${p.price}</p>
                    <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">Qty: ${p.quantity}</div>
                    <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem;">Contact Seller</button>
                </div>
            `).join('')}
        </div>
        ${getProductModalHTML()}
    `;
    attachProductFormListener(container);
}

function getProductModalHTML() {
    return `<div id="productModal" style="display:none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000;">
            <div class="card animate-fade-in" style="width: 90%; max-width: 400px;">
                <h3>List Produce</h3>
                <form id="addProductForm">
                    <div class="form-group"><label class="form-label">Produce Name</label><input type="text" id="p_name" class="form-control" required></div>
                    <div class="form-group"><label class="form-label">Quantity (e.g. 100kg)</label><input type="text" id="p_qty" class="form-control" required></div>
                    <div class="form-group"><label class="form-label">Price (e.g. 25/kg)</label><input type="text" id="p_price" class="form-control" required></div>
                    <div style="text-align: right; margin-top: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('productModal').style.display='none'">Cancel</button>
                        <button type="submit" class="btn btn-primary">List Item</button>
                    </div>
                </form>
            </div>
        </div>`;
}

function attachProductFormListener(container) {
    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newProd = {
                id: Date.now(),
                name: document.getElementById('p_name').value,
                quantity: document.getElementById('p_qty').value,
                price: document.getElementById('p_price').value,
                seller: currentUser.name
            };
            const products = JSON.parse(localStorage.getItem('krishi_products') || '[]');
            products.push(newProd);
            localStorage.setItem('krishi_products', JSON.stringify(products));
            document.getElementById('productModal').style.display = 'none';
            renderMarket(container);
        });
    }
}
function showProductModal() { document.getElementById('productModal').style.display = 'flex'; }

/* ============================
   6. Custom Modules (Schemes, Admin)
   ============================ */
function renderSchemes(container) {
    container.innerHTML = `
        <h3>Government Schemes</h3>
        <p class="text-muted" style="margin-bottom: 1.5rem;">Latest support schemes for farmers.</p>
        <div style="display: grid; gap: 1rem;">
            <div class="card">
                <h4>PM-Kisan Samman Nidhi</h4>
                <p class="text-muted">Financial benefit of Rs. 6000/- per year in three installments.</p>
                <div style="margin-top: 1rem;"><span class="btn btn-secondary" style="padding: 0.5rem 1rem;">Check Eligibility</span></div>
            </div>
            <div class="card">
                <h4>Soil Health Card Scheme</h4>
                <p class="text-muted">Government provides soil cards to farmers with crop-wise nutrient recommendations.</p>
                <div style="margin-top: 1rem;"><span class="btn btn-secondary" style="padding: 0.5rem 1rem;">Apply Now</span></div>
            </div>
             <div class="card">
                <h4>Pradhan Mantri Fasal Bima Yojana</h4>
                <p class="text-muted">Crop insurance scheme for yield protection.</p>
                <div style="margin-top: 1rem;"><span class="btn btn-secondary" style="padding: 0.5rem 1rem;">View Details</span></div>
            </div>
        </div>
    `;
}

function renderAdmin(container) {
    const users = JSON.parse(localStorage.getItem('krishi_users') || '[]');
    const queries = JSON.parse(localStorage.getItem('krishi_queries') || '[]');

    container.innerHTML = `
        <h3 style="color: var(--danger);">Admin Panel</h3>
        <p class="text-muted" style="margin-bottom: 2rem;">System Overview and User Management</p>
        
        <div class="stats-grid" style="margin-bottom: 2rem;">
            <div class="stat-card">
                 <div class="stat-icon" style="background: #eee;">👥</div>
                 <div><h3>${users.length}</h3><p>Total Users</p></div>
            </div>
             <div class="stat-card">
                 <div class="stat-icon" style="background: #eee;">❓</div>
                 <div><h3>${queries.length}</h3><p>Total Queries</p></div>
            </div>
        </div>

        <div class="card">
            <h4>Registered Farmers</h4>
            <div class="table-container" style="margin-top: 1rem; max-height: 300px; overflow-y: auto;">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Location</th><th>Type</th></tr></thead>
                    <tbody>
                        ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.location}</td><td>${u.userType}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
