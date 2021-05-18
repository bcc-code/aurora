# Changelog

## Unreleased

## \[1.4.3\] - 2021-05-18

### Added

* Add global settings menu
* Preload images in feed before animating the el in
* Handle post requests on /firebase/ (for AppleTV)

### Fixed

* Proper updates for contribs counter
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
