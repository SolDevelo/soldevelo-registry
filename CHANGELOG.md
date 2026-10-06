# Changelog

Every release of the registry, written for the people who use it. This file is
the source of truth for the [changelog page](https://registry.soldevelo.com/changelog),
so describe a change here first, in plain language, and the site will follow.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
You install items by name rather than by version, so a release says what
changed in the catalog, not a number you have to pin.

## [0.0.5] - 2026-10-06

OpenLMIS UI now follows the latest shipped screens. The catalog separates
reusable building blocks from complete page examples. All data is mocked,
and edits update local state.

### Added

- Mock page templates for role administration, profiles, valid sources and
  destinations, system settings, products, facilities, stock reasons, lots,
  service accounts, programs and facility types.
- Sign-in, forgot-password and reset-password page templates,
  including validation, result states and a session-expired dialog example.
- Shared form actions, bordered settings rows, a calendar date picker,
  password requirements and pure text-number validation helpers.
- Searchable combobox filters, wrapping workspace tabs, and table selection
  controls for bulk actions.
- A controlled copy button and value display, a label details popover,
  a segmented meter and a composable list of status meters.
- Number, decimal, textarea, select, multiple-choice combobox, tags, image
  and date controls in the form fields kit.

### Changed

- Auth Card, Dashboard Card, Settings List and Stat Strip are now blocks,
  alongside Data Table, List Toolbar and Workspace.
- Filter and form comboboxes show up to 50 options immediately. Larger lists
  include a message suggesting search, which narrows the full set of options.
  The rendering limit is configurable.
- Domain-specific columns, forms, dialogs and dashboard widgets now ship
  inside their page templates. Shared UI remains separately installable.
- Form fields support stacked, row and inline layouts, shared password
  visibility, accessible hints and errors, radio tiles, and compact switches
  with descriptions in popovers.
- User examples show mismatched account statuses, keep contact fields left
  to right, and validate usernames using Latin letters, numbers and underscores.
- Password examples show the rules while typing and check the user's name.
- Role assignment examples show rights beside the role and support read-only use.
- Table skeletons can omit pagination for lists that are not paged. Tables
  support selected rows, checkbox skeletons, reusable frames and header labels.
- Workspaces and their action footers can use a narrow width.
- Dialogs focus the first field, keep touch openings from raising the keyboard,
  and retain submit-button focus while pending. Opening a dialog from a row
  menu keeps focus inside it.
- Long filter values and approval program names truncate without hiding
  their labels or periods. Dashboard errors can show an offline state,
  and percentages follow the requested locale.

### Fixed

- The Select Filter preview gives Supplying Facility more room for the
  selected name, while keeping Status compact and fitting narrow screens.

- Label Popover examples are centered and have room for open panels.
  Date Picker previews have enough height for an open calendar.
- Workspace actions stay together at the bottom of a column layout,
  including when the page scrolls.
- Discarding profile changes after a password change clears the unsaved
  form values as well as the change count.
- Copy feedback clears when focus or the pointer leaves the control,
  including browsers that do not focus clicked buttons.

### Removed

- The duplicate No Access Page template. Use the reusable No Access component
  inside a workspace or another page layout.
- Standalone domain-specific table, form and dialog catalog entries. Install
  their page template to obtain the complete mocked example, or compose a
  new workflow from Data Table, Form Fields, Form Dialog and the shared controls.

## [0.0.4] - 2026-09-25

The site now counts what visitors find useful, without cookies and without
following anyone around.

### Added

- Privacy-friendly analytics: the site stores nothing in your browser, sets no
  cookies and records no sessions, so there is no consent banner to click
  through. Visits are counted by a hash that changes every day.
- Installs from the shadcn CLI are counted per item, so we can see which
  blocks people actually use. Only a daily hash of your network is kept,
  never your address.
- A Privacy Policy link in the footer.

## [0.0.3] - 2026-09-24

Two more OpenLMIS screens, and items that are only UI.

### Added

- The OpenLMIS home dashboard: a dashboard card, a stat strip, requisitions by
  period, a requisition status meter, cold chain equipment status, an
  approvals table, and the complete home dashboard template.
- Edit User Roles: a role assignments table, dialogs to add a role, import
  another user's roles, see what a role allows and discard unsaved changes,
  and the complete user roles page.
- A not found page that shows the address that was asked for, with Go Back
  and Back Home.
- A callout for warning, info and success messages, which the stock Alert has
  no tones for.
- Warning and info tones for the status badge, and a bar at the bottom of the
  workspace for page-wide actions such as Save.

### Changed

- Every item now brings the destructive, success, warning and info colours, so
  a single install is enough to use them anywhere, and your own theme values
  stay as they are.
- Items no longer fetch data: blocks take their data and callbacks as props,
  and templates run on mock data you swap for your own.

## [0.0.2] - 2026-09-23

A new set of OpenLMIS items that build on each other, and a page for every
item.

### Added

- The OpenLMIS list page set: pagination, a search input, a select filter,
  column view options, a status badge and page breadcrumbs; a server-paged data
  table, a workspace page frame and a list toolbar; and the complete users list
  page built from them.
- Form fields, a form dialog, and the Add User, Edit User and Reset Password
  dialogs.
- Items build on each other: installing a block brings the components it uses,
  and each one installs only once.
- Every item has its own page, with its preview, install command and details.
- A page for each project, listing everything it contributed.

### Changed

- Previews size themselves to their content, so nothing is cut off or left
  half empty at any width.
- Items install by their full address, whether or not you have added the
  `@soldevelo` registry to your project.
- The list page works in any React app, not only Next.js.

### Removed

- The five items from the first release, replaced by the list page set above.

## [0.0.1] - 2026-09-21

The first release: the catalog, the first items you can install, and the guide
that explains how.

### Added

- Five OpenLMIS items to start from: a requisition status pill, a requisition
  line items table, a stock on hand summary, a facility and period filter bar,
  and a complete requisition approval page.
- One command installs any of them. The code is copied into your own project,
  yours to read and change, with nothing hidden behind a package you have to
  keep up with.
- A catalog that previews every item the way it will actually look, with the
  code it installs sitting next to it.
- Every item says which project it came from, so as more projects join it
  stays clear where a design originated.
- A guide covering what you need before you start, how to connect your project
  to the registry, where the files land, and how to let a coding assistant
  search the catalog for you.
- Colours for success, warning and information states travel with any item
  that uses them, so nothing arrives looking half finished, and your own theme
  is left as you set it.
