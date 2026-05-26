
### 5. Test matrix

Run these in order.

#### Device CRUD

- [x] Sign in as guest.
- [x] Create a device.
- [x] Confirm it appears in the device list after refresh.
- [ ] Edit the device name, watt, or default duration.
- [ ] Confirm the edited values persist.
- [ ] Delete the device.
- [ ] Confirm it disappears from the list.


> NOTE: Edit/Delete not implemented yet.
>
> I don't know why, but there's many error like these:
> ERROR  Failed to fetch today usage from backend [Error: Protected API requests require an authenticated Firebase user.]
> ERROR  Failed to fetch energy history from backend [Error: Protected API requests require an authenticated Firebase user.]
> ERROR  Queued electricity usage draft for later sync [Error: Protected API requests require an authenticated Firebase user.]
> ERROR  [Error: Uncaught (in promise, id: 5) Error: Protected API requests require an authenticated Firebase user.]

#### Usage create through `device_breakdown`

- [x] Create two devices.
- [x] Trigger a usage submission from the device-driven flow.
- [ ] Confirm backend request hits `POST /v1/electricity-usages`.
- [ ] Confirm history updates after polling refresh.
- [ ] Confirm monthly summary totals increase.
- [ ] Confirm current streak is present in the summary response.

> NOTE: [Error: Too many requests. Try again later.]
> I don't know why, but there's many error like these:
> ERROR  Failed to fetch devices from backend [Error: Too many requests. Try again later.]
> ERROR  Failed to fetch energy history from backend [Error: Too many requests. Try again later.]
> ERROR  Failed to fetch today usage from backend [Error: Too many requests. Try again later.]
> ERROR  Queued electricity usage draft for later sync [Error: Too many requests. Try again later.]
>
> In the firestore, there is so many electricity_usages log:
> 12 doc, like I even don't use the app for more that 2 minute, with It writes firestore doc too much

#### Insight auth rules

- [ ] As guest, trigger insight fetch/generation.
- [ ] Confirm backend returns `403 forbidden`.
- [ ] Sign in with a full account.
- [ ] Trigger insight fetch/generation again.
- [ ] Confirm success and returned `isStale`.

> NOTE: Can confirm, because the button doesn't function as expected, like its not clickable
> Also, maybe it's not implemented yet on mobile

#### Stale insight behavior

- [ ] As full account, generate insight for the current month.
- [ ] Create or update another usage log in the same month.
- [ ] Call `POST /v1/generate-energy-insight` again with `force: false`.
- [ ] Confirm returned insight now has `isStale: true` until regenerated.
- [ ] Call again with `force: true`.
- [ ] Confirm returned insight has `isStale: false`.

> NOTE: Can confirm, because the button doesn't function as expected, like its not clickable
> Also, maybe it's not implemented yet on mobile

#### Usage update and delete

Use direct API calls if the current mobile UI does not expose these clearly yet.

- [x] Create a usage log.
- [x] Capture its `usageId`.
- [ ] `PATCH /v1/electricity-usages/:usageId` with a changed valid payload.
- [ ] Confirm monthly summary refreshes.
- [ ] `DELETE /v1/electricity-usages/:usageId`.
- [ ] Confirm monthly summary and streak refresh again.

> NOTE: Edit/Delete not implemented yet on mobile (not this time).

Example:

```bash
curl -X PATCH "$API_BASE_URL/v1/electricity-usages/$USAGE_ID" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputType": "kwh",
    "input": { "kwh": 3.2, "meterStart": null, "meterEnd": null, "unit": "kwh" },
    "period": { "startDate": "2026-05-01", "endDate": "2026-05-31", "month": "2026-05" },
    "source": { "createdFrom": "mobile", "offlineCreated": false },
    "timestamps": { "usageDate": "2026-05-25", "createdAtClient": "2026-05-25T10:30:00.000Z" }
  }'
```

```bash
curl -X DELETE "$API_BASE_URL/v1/electricity-usages/$USAGE_ID" \
  -H "Authorization: Bearer $ID_TOKEN"
```

#### Offline create queue

- [ ] Put the device in airplane mode or disable network.
- [ ] Trigger usage create from the mobile flow.
- [ ] Confirm the app does not crash.
- [ ] Re-enable network.
- [ ] Wait for the next polling/sync cycle.
- [ ] Confirm the usage appears in history and summary.

> NOTE: I didn't try because there's too much error logs.
> - [Error: Too many requests. Try again later.]
> - [Error: Protected API requests require an authenticated Firebase user.]
