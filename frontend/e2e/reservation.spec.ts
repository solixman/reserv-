import { test, expect } from '@playwright/test';

/**
 * Scenario:
 * 1. Participant registers and books an existing event.
 * 2. Admin logs in and confirms the reservation.
 * 3. End.
 */

test.describe('End-to-End Reservation Flow', () => {
    const timestamp = Date.now();
    const participantEmail = `e2e_user_${timestamp}@test.com`;
    // Admin credentials provided by the user
    const adminEmail = 'admin11@gmail.com';
    const adminPassword = 'bassword';
    const participantPassword = 'Password123!';
    const participantName = `E2E User ${timestamp}`;

    test('full flow: participant book -> admin confirm', async ({ page }) => {
        test.setTimeout(180000);

        // --- STEP 1: Participant Registration ---
        console.log('--- STEP 1: Participant Registration ---');
        console.log('Navigating to /register...');
        await page.goto('/register');

        await expect(page.getByRole('heading', { name: /Create Account/i })).toBeVisible({ timeout: 30000 });

        console.log('Filling out registration form...');
        await page.getByPlaceholder('John Doe').fill(participantName);
        await page.getByPlaceholder('name@example.com').fill(participantEmail);
        await page.getByPlaceholder('••••••••').fill(participantPassword);

        console.log('Clicking "Sign Up"...');
        await page.getByRole('button', { name: /Sign Up/i }).click();

        console.log('Waiting for redirection to /events...');
        await expect(page).toHaveURL(/\/events/, { timeout: 40000 });

        // --- STEP 2: Participant Booking ---
        console.log('--- STEP 2: Participant Booking ---');
        console.log('Finding an event card...');
        const eventCard = page.locator('div.group.relative').first();
        await expect(eventCard).toBeVisible({ timeout: 30000 });

        const eventTitle = await eventCard.locator('h3').innerText();
        console.log(`Selecting event: "${eventTitle}"`);

        await eventCard.getByRole('link', { name: /view details/i }).click();
        await expect(page).toHaveURL(/\/events\/\d+/, { timeout: 30000 });

        console.log('Clicking "Book Your Spot"...');
        const bookButton = page.getByRole('button', { name: /book your spot/i });
        await expect(bookButton).toBeVisible({ timeout: 20000 });

        // Wait for the booking network request
        const bookingRequest = page.waitForResponse(
            response => response.url().includes('/reservations') &&
                response.request().method() === 'POST' &&
                response.status() >= 200 && response.status() < 300,
            { timeout: 30000 }
        );

        await bookButton.click();
        await bookingRequest;
        console.log('Booking request confirmed by server.');

        // Allow some time for UI to reflect changes
        await page.waitForTimeout(2000);

        // --- STEP 3: Admin Confirmation ---
        console.log('--- STEP 3: Admin Confirmation ---');
        console.log('Navigating to /login...');
        await page.goto('/login');

        await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible({ timeout: 30000 });

        console.log('Logging in as Admin...');
        await page.getByPlaceholder('name@example.com').fill(adminEmail);
        await page.getByPlaceholder('••••••••').fill(adminPassword);
        await page.getByRole('button', { name: /Sign In/i }).click();

        console.log('Waiting for admin dashboard redirection...');
        await expect(page).toHaveURL(/\/admin/, { timeout: 40000 });

        console.log('Navigating to Reservations management...');
        await page.goto('/admin/reservations');

        console.log(`Searching for reservation for participant: "${participantName}"`);
        // Verify table is loaded
        await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });

        // Find the row containing our unique timestamp or name
        const reservationRow = page.locator('tr').filter({ hasText: participantName });
        await expect(reservationRow).toBeVisible({ timeout: 30000 });

        console.log('Checking for PENDING status...');
        await expect(reservationRow.getByText(/PENDING/i)).toBeVisible({ timeout: 15000 });

        console.log('Clicking "Confirm"...');
        const confirmBtn = reservationRow.getByTitle(/Confirm/i);
        await confirmBtn.click();

        console.log('Verifying status changed to CONFIRMED...');
        await expect(reservationRow.getByText(/CONFIRMED/i)).toBeVisible({ timeout: 30000 });

        console.log('--- TEST SUCCESSFUL ---');
    });
});
