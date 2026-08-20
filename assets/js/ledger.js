/* =========================================================================
   The return ledger, resolved against the visitor's own clock.

   This is the only JavaScript on laytr.app, and it exists for one reason:
   Laytr's central claim is that a named moment resolves to a concrete time
   and the item comes back exactly then. Printing a generic "Sat 9:00 AM"
   would be a picture of that promise. Computing it in the reader's timezone
   is the promise itself.

   It is a direct port of ReturnChoice.resolvedDate / .label in
   Laytr/Services/Capture/ReturnChoice.swift. If that file changes, change
   this one in the same commit -- the website must never describe a schedule
   the app does not keep.

   Progressive enhancement, strictly: the HTML already contains correct,
   readable text. This only sharpens it. Nothing here is required for the
   page to make sense, and any failure leaves the served markup alone.
   ========================================================================= */

(function () {
  "use strict";

  var EVENING_HOUR = 21; // ReturnChoice.eveningHour
  var MORNING_HOUR = 9; // ReturnChoice.morningHour

  var SATURDAY = 6; // JS getDay(): Sunday is 0
  var MONDAY = 1;

  function atHour(date, hour) {
    var d = new Date(date.getTime());
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  function addDays(date, days) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  function startOfDay(date) {
    return atHour(date, 0);
  }

  /* The next `weekday` at `hour`, allowing today when that time is still
     ahead -- the same allowance nextOccurrence(ofWeekday:) makes. */
  function nextOccurrence(weekday, hour, now) {
    var today = atHour(now, hour);
    if (now.getDay() === weekday && today > now) {
      return today;
    }
    var cursor = addDays(now, 1);
    for (var i = 0; i < 8; i += 1) {
      if (cursor.getDay() === weekday) {
        return atHour(cursor, hour);
      }
      cursor = addDays(cursor, 1);
    }
    return null;
  }

  function resolve(choice, now) {
    switch (choice) {
      case "tonight": {
        var tonight = atHour(now, EVENING_HOUR);
        return tonight > now ? tonight : atHour(addDays(now, 1), EVENING_HOUR);
      }
      case "weekend":
        return nextOccurrence(SATURDAY, MORNING_HOUR, now);
      case "next-week": {
        /* On a Monday, "next week" must mean the following Monday. */
        var base = now.getDay() === MONDAY ? addDays(now, 1) : now;
        return nextOccurrence(MONDAY, MORNING_HOUR, base);
      }
      default:
        return null;
    }
  }

  function formatTime(date) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit"
      }).format(date);
    } catch (error) {
      return null;
    }
  }

  function formatDay(date, now) {
    var days = Math.round(
      (startOfDay(date) - startOfDay(now)) / 86400000
    );
    if (days === 0) {
      return "Today";
    }
    try {
      if (days <= 7) {
        return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
      }
      return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short"
      }).format(date);
    } catch (error) {
      return null;
    }
  }

  /* "Today · 9:00 PM" / "Sat · 9:00 AM" / "24 Dec · 6:30 PM" */
  function label(date, now) {
    var time = formatTime(date);
    var day = formatDay(date, now);
    if (!time || !day) {
      return null;
    }
    return day + " · " + time;
  }

  function apply() {
    var rows = document.querySelectorAll("[data-return]");
    if (!rows.length) {
      return;
    }
    var now = new Date();

    Array.prototype.forEach.call(rows, function (node) {
      var resolved = resolve(node.getAttribute("data-return"), now);
      if (!resolved) {
        return; /* Someday has no date, and says so in the markup. */
      }
      var text = label(resolved, now);
      if (!text) {
        return; /* No Intl support: the served text stands. */
      }
      var slot = node.querySelector("[data-return-value]");
      if (slot) {
        slot.textContent = text;
      }
    });

    var stamp = document.querySelector("[data-return-stamp]");
    if (stamp) {
      var zone = "";
      try {
        zone = new Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      } catch (error) {
        zone = "";
      }
      stamp.textContent = zone
        ? "Resolved in your timezone · " + zone
        : "Resolved on your device";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
