# TODO - Add role selection (admin/staff)

- [ ] Update DB alignment strategy
  - Decide whether to map frontend `staff` -> backend DB `manager` (minimal impact), or change DB enum to include `staff`.
- [ ] Update backend `/api/signup` to persist `role` column
  - Include `role` in INSERT into `Users`.
  - Map frontend `staff` -> DB `manager` (if using minimal-impact approach).
  - Validate role values to prevent SQL errors.
- [ ] Update frontend `SignUp.jsx`
  - Add role dropdown/select with `admin` and `staff`.
  - Ensure the selected role is submitted.
- [ ] (Optional) Update backend role checks if DB enum changes
  - If changing DB enum to `staff`, update RBAC middleware accordingly.
- [ ] Test
  - Sign up as `staff`, login, verify JWT role is `manager` and staff RBAC works.
  - Sign up as `admin`, verify admin RBAC works.
