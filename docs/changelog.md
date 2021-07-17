# Changelog

## \[1.6.2\] - 17.07.2021

### Changed

* Info-box now has prop to hide background when used as a component on screen A.

## \[1.6.1\] - 17.07.2021

### Changed

* Design on feed info-box, because text was white against white bg.

## \[1.6.0\] - 14.07.2021

### Fixed

* Don't crash if there is no program element
* 
### Changed

* Remove faded BG #25249229
* Adjust scroll speed of image grid
* Made images in grid all square

### Added

* Members Sync
  * Every week sync data of the user (on action)
  * Sync children data automatically
* Allow API requests to stateless checkin (web)
* Add World map to L&R screens
* Allow shuffling of auto-pushed elements
* Fake checkin coordinates based on the church location

## \[1.5.0\] - 01.07.2021

### Fixed

* Background video from templates is now applied

### Added

* Don't allow empty author on verses
* Show element type on desk
* Record start and end time of program elements
* Started with Unit tests
* Allow getting of linked users
* Allow voting on behalf of linked users

### Removed

* Remove "URL" question

## \[1.4.12\] - 2021-06-17

### Added 

* ImpEx functionality

### Fixed

* Don't crash checkin if there is no event in progress

## \[1.4.11\] - 2021-06-07

### Added

* Events api for BTV
* Allow firebase functions to accept firebase tokens (Machine auth)

## \[1.4.7 - 1.4.10\]

* Various hotfixes

## \[1.4.6\] - 2021-05-21

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
