ANZ Netball Championship Data Visualisation Website
Authors: Leon North and Kalo Pilato

Browser Compatibility:
  -Firefox ONLY! Due to the data files being accessed directly from the local file system this website will not work in other browsers.
  -Testing has only been conducted in v38.0.5, other versions may exhibit unexpected behaviour.

Entry Point:
  -index.html

Loading Additional Data:
  -Additional data files may be added to the system provided that they meet ALL of the following criteria:
    *Files must EXACTLY match the format of any one of the default data files (years 2008 - 2013)
    *Filenames must EXACTLY conform to the default data file naming convention (changing ONLY the year)
    *File types must be .csv
    *Resulting file set must be a sequential and complete set of files between a specific start and end year (inclusive)
    *Data in the additional files must conform to the default data (same teams, numbers of rounds, etc)
  -To add files:
    1) Copy new files into the ANZChampionshipResults folder (containing the default data .csv files)
    2) Update and save config.cfg file with the year of the first and last data files in the file set (2008,2013 by default)
    3) Refresh/Load index.html to see changes
