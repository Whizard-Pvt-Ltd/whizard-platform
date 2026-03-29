# Manage

| Test Case ID | Test Name | Status | Failure Type | Duration | Notes |
| --- | --- | --- | --- | ---: | --- |
| MW-001 | loads industry context and current WRCF columns | Passed | Verified | 5.4 s |  |
| MW-002 | does not save a functional group with a blank name | Failed | Environment / Auth Flake | 6.2 s | Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveURL[2m([22m[32mexpected[39m[2m)[22m failed Expected pattern: [32m/\/dashboard/[39m Received string: [31m"http://localhost:4200/login"[39m Timeout: 5000ms Call log: [2m - Expect "toHaveURL" with timeout 5000ms[22m [2m 9 × unexpected value "http://localhost:4200/login"[22m |
| MW-003 | creates a functional group with mandatory name and optional blank description | Passed | Verified | 6.7 s |  |
| MW-004 | allows editing a functional group and saving without changing the name | Passed | Verified | 8.0 s |  |
| MW-005 | supports single quotes in functional group name and description through the UI | Passed | Verified | 7.1 s |  |
| MW-006 | creates a primary work object under the selected functional group | Timed Out | Environment / Runtime Failure | 30.1 s | [31mTest timeout of 30000ms exceeded.[39m \| Error: locator.selectOption: Test timeout of 30000ms exceeded. Call log: [2m - waiting for getByRole('combobox').nth(1)[22m [2m - locator resolved to <select ng-reflect-model="" _ngcontent-ng-c2195223369="" ng-reflect-is-disabled="false" class="filter-select ng-untouched ng-pristine ng-valid">…</select>[22m [2m - attempting select option action[22m [2m 2 × waiting for element to be visible and enabled[22m [2m - did not find some options[22m [2m - retrying select option action[22m [2m - waiting 20ms[22m [2m 2 × waiting for element to be visible and enabled[22m [2m - did not find some options[22m [2m - retrying select option action[22m [2m - waiting 100ms[22m [2m 52 × waiting for element to be visible and enabled[22m [2m - did not find some options[22m [2m - retrying select option action[22m [2m - waiting 500ms[22m |
| MW-007 | creates a secondary work object under the selected primary work object | Passed | Verified | 12.4 s |  |
| MW-008 | blocks duplicate functional group names on create | Skipped | Pending / Blocked | 3.4 s |  |
| MW-009 | blocks duplicate functional group rename on edit | Skipped | Pending / Blocked | 3.6 s |  |
| MW-010 | blocks whitespace-only duplicate names on create and edit | Skipped | Pending / Blocked | 3.4 s |  |
| MW-011 | prevents functional group creation before an industry is selected | Skipped | Pending / Blocked | 3.6 s |  |
