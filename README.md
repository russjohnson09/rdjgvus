rdjgvus
=======
This is the source code for my site. 


Contacts
==
The default control contact-db is given a table and a knockout object. The control works with tablesorter and
triggers the addRow event when appropriate. The other events are "loadComp" which is triggered after all 
records have been loaded and 'connected' on database connection. It listens for events addRec(e,rec) and
removeRec(e,recId).


*Default control - 
*Default view - The following items are available to the view. persons - list.

table-select- listens for removeRows 


