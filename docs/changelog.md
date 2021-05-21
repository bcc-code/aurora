# Changelog

## \[1.4.6\] - Unreleased

### Added

* Proper API for authenticated donations URL

## \[1.4.5\] - 2021-05-20

### Changed

* Updated donations text on screen A

### Fixed

* "Default Text" component not showing up on screen A
  * This is related to the creation of a new event, so all events created prior to 1.4.4 have this issue.
  * It can be manually fixed in the DB
* Persons with no ChurchID are unable to submit contributions
* Updated verse shorthands so they are compatible with the server
* Init *counter* not counters

## \[1.4.3\] - 2021-05-18

### Added

* Add global settings menu
* Preload images in feed before animating the el in
* Handle post requests on /firebase/ (for AppleTV)
* Count of contributions pushed
* Dummy collection URL function

### Fixed

* Fix broken delete routes
* Fix wrong type when picking winner
 
## \[1.4.2\]

### Fixed

* Do not increase checkin counter if the person is already checked in

## \[1.4.1\] - 2021-05-12

### Added

* Demo video on screens for non-prod envs
* Stateless checkin
* Docs using GH pages


## \[1.4.0\] - 2021-05-10

Bumped to 1.4 because of the massive changes in the firebase functions.

### Added

* Started using GitBook for documentation
* Added `getSignedDonationsURL` dummy function

### Changed

* "canCheckin" now respects the setting in firebase
* Upgrades to firebase functions:
  * Typescript
  * Parcel 2
  * Proper eslint config
  * Lots of small updates and upgrades
