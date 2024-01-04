# Patch Update Checklist

This is a guide for steps to update cactbot when FFXIV has a patch.

## Game Data Resource Updates

Once the patch is downloadable, [XIVAPI](https://xivapi.com) will be updated
with new game data shortly (often within 6 hours, although major patches can take longer).
To see if XIVAPI has been updated,
check the `#important` channel in the [XIVAPI Discord server](https://discord.gg/MFFVHWC).

### Run update scripts

Cactbot uses a number of resources files that are sourced from game data.
Once XIVAPI is updated, you can refresh those files data
by running `npm run util generate` from your cacbot root repo directory.
From the interactive menu, you can choose to run one at a time,
or you can run all of them by selecting `* Generate All Data Files`.
The scripts that will be run (and the resources files they genereate) are:

```typescript
gen_effect_ids.ts  => resources/effect_id.ts
gen_hunt_data.ts => resources/hunt.ts
gen_pet_names.ts => resources/pet_names.ts
gen_weather_rate.ts => resources/weather_rate.ts
gen_world_id.ts => resources/world_id.ts
gen_zone_id_and_info.ts => resources/zone_id.ts, zone_info.ts, content_type.ts
```

You can also choose a logging level to control how much output you'll see
in the console as the scripts are run.
It is recommended that you choose at least the 'Alert' level to ensure you are notified
of any problems that require manual intervetion before merging the file changes.

#### effect_id data

As new status effects are added to the game, those names may conflict with existing names.
Effect names may be reused in later content with a new ID
(`Vulnerability Up`, for example, is commonly re-added with a different ID).
Core player-applied job status effects are also often mirrored in PvP, but with different IDs.
And job changes may result in a new status effect being added,
rather than replacing the existing one of the same name.
In short, there are many reasons why there may be multiple entries
in the `Status` table with the same name.

The script maintains a set of 'known mappings' of player-applied status effect and IDs.
To support the jobs module, these status effects will always be added with these IDs,
and any conflicts will be disregarded.  
This is problematic if a job is updated and a new status is added with the same name/new ID.
The script will notify of a conflict only at the 'debug' logging level only,
because the current list of conflicts is extremely noisy.
So until better state-tracking between game patches is implemented,
the only other method to determine if a job effect has been replaced with a new status ID
is if the jobs module stops properly tracking the buff, or if someone notices in game data.

Tf a job status effect has been reassigned a new statuus ID in game,
make sure to update `knownMapping` in `gen_effect_id` with the new ID,
and re-run the script.

#### hunt data

When a new expansion releases, new hunt marks will be picked up by the update script.
However, at least for Shadowbringers and Endwalker,
the 'SS'-rank bosses and their pre-spawn 'minions'
have a `Rank` value of 3 ('S'-rank) and 1 ('B'-rank), respectively.
The only way to identify which hunts are  the true SS-rank and minions
is to determine the name in-game and then find their BNpcBaseId in game data.
Those BNpcBaseIds then need to be added to `minionsBNpcBaseIds`
and `ssRankBNpcBaseIds` in `gen_hunt_data`, and the script should be re-run.

#### zone_id & zone_info data

The `gen_zone_id_and_info` script usually needs special handling.
`npm run test` will let you know about this when committing or uploading.

The concept of "zones" and "zone names" in cactbot is a bit of an amalgam.
The ID used in cactbot for each zone corresponds to the zone change event,
and is derived from the `TerritoryType.ID` column.  
Names for that zone, however, may come from `ContentFinderCondition` or `PlaceName`.
The names for overworld/town zones, for example, are determined differently
than the names for raid zones.
To make matters more complicated, there is not always a 1:1 relationship between
a territory and a record in `ContentFinderCondition`.
Add in the fact that we sometimes have overworld zones
with the same name as 'content' zones (e.g. The Copied Factory raid
vs. the version you can walk around in), and this data can be complicated to unpack.

To help handle this, a separate file - `zone_overrides` maintains a list of various
known mappings where we force-map a zone name to a particular id and ignore conflicts
(e.g. `TheDiadem`). It also contains synthetic IDs and zone info
that will be force-injected into the `zone_id` and `zone_info` files,
regardless of what's in the game data.

You will likely need to update the `zone_overrides` file and re-run `gen_zone_id_and_info`
for at least major patches to account for changes.
Some of the more common conflicts and update scenarios are described below.

##### Removed Zones

If any zone has been entirely removed from the game,
but we still want to keep the data around (e.g. an unreal)
then we need to manually add its data to `zone_overrides`.

For example, in 6.5 Zurvan unreal was removed and Thordan unreal was added.
See <https://github.com/quisquous/cactbot/pull/5823/files#diff-a275c2dbc2bd9076b132684367bf1ba27604a652b5c0e39c7449f6bd64b34a9f>

This needs to be added to `_SYNTHETIC_IDS`:

```typescript
  'ContainmentBayZ1T9Unreal': 1157,
```

...and this needs to be added to `_SYNTHETIC_ZONE_INFO`:

```typescript
  1157: {
    'contentType': 4,
    'exVersion': 4,
    'name': {
      'cn': '祖尔宛幻巧战',
      'de': 'Traumprüfung - Zurvan',
      'en': 'Containment Bay Z1T9 (Unreal)',
      'fr': 'Unité de contention Z1P9 (irréel)',
      'ja': '幻鬼神ズルワーン討滅戦',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 75,
  },
```

This will allow the zone script to continue outputting this non-existent zone
so that zone files can use this id.

##### Zone Collisions

The zone id and info emitting script ignores any zones that have a name collision.
It will print these out to the console when running the script.

For example, when updating for 6.5, it emits these new lines:

```text
Alert: New or unexpected collision in resolving TheBurn: (IDs: 1173, 789). Please investigate.
Alert: New or unexpected collision in resolving TheGhimlytDark: (IDs: 1174, 793). Please investigate.
```

Because these dungeons were updated for trusts in 6.5, there are two dungeons with the same name in the game.

To handle this, add the old dungeon's id with a different name to `_SYNTHETIC_IDS`:

```typescript
  'TheBurn64': 789,
  'TheGhimlytDark64': 793,
```

Note that we've added '64' to the end of the names, to prevent continued conflicts
and to show the patch in which  these dungeons were last available
(i.e. The Burn in 6.4 and earlier).
See: <https://github.com/quisquous/cactbot/pull/5823/files#diff-a275c2dbc2bd9076b132684367bf1ba27604a652b5c0e39c7449f6bd64b34a9fR59-R61>

For many of these types of changes, the `TerritoryType` record will still be available,
and will have the remaining zone info that we need to populate `zone_info`
(including map data, content type, and weather rate).
However, to be safe, you should take the old zone info record from `zone_info`
and add it to `_SYNTHETIC_ZONE_INFO`, so we aren't reliant on that data remaining available.
Additionally, you should update the zone names
with a prefix indicating the patch when the zone was last available.
So for this example, you would add:

```typescript
  789: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '(6.4)死亡大地终末焦土',
      'de': '(6.4)Das Kargland',
      'en': '(6.4)The Burn',
      'fr': '(6.4)L\'Escarre',
      'ja': '(6.4)永久焦土 ザ・バーン',
      'ko': '(6.4)영구 초토지대',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 97,
  },
  793: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '(6.4)国境防线基姆利特暗区',
      'de': '(6.4)Die Ghimlyt-Finsternis',
      'en': '(6.4)The Ghimlyt Dark',
      'fr': '(6.4)Les Ténèbres de Ghimlyt',
      'ja': '(6.4)境界戦線 ギムリトダーク',
      'ko': '(6.4)김리트 황야',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
```

Lastly, copy (**not rename**) the existing raidboss triggers, raidboss timeline,
and oopsy triggers into new files,
e.g. `the_burn64.ts` and `the_burn64.txt`.
You'll need to manually rename the zone in several places in these files
so they don't conflict with the unmodified names in the existing files.
See: <https://github.com/quisquous/cactbot/pull/5824/files>

The reason for this is so we can maintain working triggers and timelines
for Chinese and Korean users who have not updated to the new patch
and are still using the older content.  
At the same time, we can now independently modify the triggers and timelines
for the new content (since it may have changed).

### Update Content List

`resources/content_list.ts` is a manually curated list of all content.
This is what appears on the [coverage page](https://overlayplugin.github.io/cactbot/util/coverage/coverage.html).
It is also the ordering in the cactbot config ui,
although that also sorts by expansion as well.

Manually add any dungeons, trials, raids, etc to this list.
The idea is to keep them in roughly the same sections and order as the duty finder ui
so that parts of cactbot using this for sorting puts content is a reasonable order.

See: <https://github.com/quisquous/cactbot/pull/5825/files>

## Create a Meta-issue to Track Content Work

Also consider making a meta github issue tracking new content to coordinate who is working on what.
For example, <https://github.com/quisquous/cactbot/issues/5712>.

## In Game Memory Verification

Once the game is back up, memory signatures can be checked.
You do not need a working FFXIV plugin to do this.
This could theoretically be done earlier on game data too with Ghidra etc.

### Check memory signatures

cactbot has a number of memory signatures that it uses.
(Maybe some day cactbot plugin will merge with OverlayPlugin?)

There are four signatures, which all live in [FFXIVProcessIntl.cs](https://github.com/OverlayPlugin/cactbot/blob/main/plugin/CactbotEventSource/FFXIVProcessIntl.cs).

- Charmap (information about your character)
- Job Data (gauge info for your job)
- In Combat (whether the game thinks you are in combat)

OverlayPlugin also duplicates the charmap and in combat signatures,
so if cactbot is broken please update those as well.

Look for errors in the OverlayPlugin log (ACT->Plugins->General->the scrolly textbox at the bottom).

There are two cactbot errors to look out for in the log.

1) `Charmap signature found 0 matches`
2) `Charmap signature found, but conflicting match`

The signature should match exactly one location in the executable.
If it finds zero or two in different places, then it will not work.
You will need to find a new signature.
See the [Memory Signatures](memory_signatures.md) documentation for more info.

OverlayPlugin will also print out lines like:

```text
[10/6/2023 5:13:18 PM] Info: Found in combat memory via InCombatMemory61.
[10/6/2023 5:13:18 PM] Info: Found combatant memory via CombatantMemory65.
[10/6/2023 5:13:19 PM] Info: Found target memory via TargetMemory63.
[10/6/2023 5:13:19 PM] Info: Found enmity memory via EnmityMemory60.
[10/6/2023 5:13:20 PM] Info: Found aggro memory via AggroMemory60.
[10/6/2023 5:13:20 PM] Info: Found enmity HUD memory via EnmityHudMemory62.
```

...and will print errors if it is not found.

### memtest overlay

Even if all the signatures are found,
the offsets might be incorrect.

If you add the [cactbot test overlay](../README.md#test-overlay)
as an Overlay, it will give you a bunch of information from memory.

The most important values are: zone, name, and job id.

Here is a screenshot after the 6.5 patch where the job is broken.

![test overlay](images/newpatch_testoverlay.png)

If the signatures are correct, but the offsets are wrong they need to be updated in
[FFXIVProcessIntl.cs](https://github.com/OverlayPlugin/cactbot/blob/main/plugin/CactbotEventSource/FFXIVProcessIntl.cs).
See <https://github.com/quisquous/cactbot/pull/5826/files> as an example.

#### Verify basic info

Verify name and id (if you know your own id).
Job breaks more often than not,
but is usually only adjusted slightly.

Face south. Rotation should be ~0.
Face east. Rotation should be ~pi/2.
Walk east. The x position value should increase.
Walk south. The y position value should increase.
Jump. The z position value should increase.

The other thing that breaks a lot is the shield percentage.
It would be nice to add this to the test overlay.
You can see it as a yellow overlay on top of hp in the jobs overlay.

#### Verify In Combat

Hit a target dummy.
The `game: no` should switch to `game: yes`.
Reset your aggro, it should switch back to `game: no`.
If the FFXIV plugin hasn't been updated, it will likely say `act: no`.

### Verify Job data

Job data only infrequently changes (during a job rework or at each expansion).
It is not ~usually verified (as there are a lot of jobs) before doing a release.
Test at least one job with the cactbot jobs overlay and make sure boxes update.

## et voila, release

Once the resources are updated and the signatures and memory data look good,
do a cactbot release!

## Other Things

It'd be nice to have a list of OverlayPlugin steps too, but that could live elsewhere.

### New expansion changes

When a new expansion releases, there are a variety of changes that will be needed
in various files to, e.g., support new jobs or account for job changes/re-works.
This is a partial working list of potential changes that may be needed:

- Update buff tracker with job buff changes
   See <https://github.com/quisquous/cactbot/pull/3717>

- Add job icons
   See <https://github.com/quisquous/cactbot/pull/3718> & <https://github.com/quisquous/cactbot/pull/3723>

- Add new job enums
   See <https://github.com/quisquous/cactbot/pull/3719>

- Add new expac to config files
   See <https://github.com/quisquous/cactbot/pull/3725>
