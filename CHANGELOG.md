# Changelog

Every release of the registry, written for the people who use it. This file is
the source of truth for the [changelog page](https://registry.soldevelo.com/changelog),
so describe a change here first, in plain language, and the site will follow.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
You install items by name rather than by version, so a release says what
changed in the catalog, not a number you have to pin.

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
