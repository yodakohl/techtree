# Source Locator Contribution: air_traffic_control chronology

## Target node

- `air_traffic_control`
- Current risk report status: Modern source-checked era-default date (`1945`)
- Suggested corrected scope: operational air traffic control as a tower/airport traffic-control practice, not later radar/computerized ATC.

## Proposed correction

```json
{
  "id": "air_traffic_control",
  "firstKnownDate": 1920,
  "datePrecision": "year",
  "region": "United Kingdom / Croydon Airport",
  "reviewStatus": "source_checked"
}
```

## Source locator

- Title: Air traffic control
- Publisher: Encyclopaedia Britannica
- URL: https://www.britannica.com/technology/air-traffic-control
- Locator: history section describing the first airport traffic control tower at Croydon, London, in 1920.
- Source type: textbook
- Supports: node chronology and region

## Rationale

The current default `1945` makes the node look like a postwar technology. That is too late for the broad node scope if `air_traffic_control` means organized airport traffic control. Croydon's 1920 control tower is a better first-known anchor for the broad operational concept. Later radar-based and computerized ATC should remain downstream or more specific nodes rather than defining the first-known date of the broad node.

## Conservative caveat

This correction should not be used if the canonical node description is intended to mean radar-assisted or networked modern ATC systems. In that case, the node should be renamed/rescoped instead of simply redated.

## Suggested validation

```sh
npm test
npm run quality
npm run accuracy:risks -- --markdown --limit 20
```
