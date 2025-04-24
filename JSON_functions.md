### JSON Functions 


### 1. JSON_VALUE

**Purpose**: Extracts a scalar value from JSON data.

#### Example:
```sql
SELECT JSON_VALUE(json_data, '$.author') AS author
FROM json_table
WHERE id = 123;
```
This query extracts the value of the `author` field from the JSON data.

### 2. JSON_QUERY

**Purpose**: Extracts a JSON fragment (object or array) from JSON data.

#### Example:
```sql
SELECT JSON_QUERY(json_data, '$.tags') AS tags
FROM json_table
WHERE id = 123;
```
This query extracts the `tags` array from the JSON data.

### 3. JSON_EXISTS

**Purpose**: Checks if a specified JSON path exists in the JSON data.

#### Example:
```sql
SELECT id, json_data
FROM json_table
WHERE JSON_EXISTS(json_data, '$.tags[*]?(@ == "science")');
```
This query checks if the `tags` array contains the word "science".

### 4. JSON_TABLE

**Purpose**: Converts JSON data into relational data.

#### Example:
```sql
SELECT jt.id, jt.title, jt.author, jt.tag
FROM json_table jt,
     JSON_TABLE(jt.json_data, '$'
         COLUMNS (
             id NUMBER PATH '$.id',
             title VARCHAR2(100) PATH '$.title',
             author VARCHAR2(50) PATH '$.author',
             tag VARCHAR2(50) PATH '$.tags[*]'
         )
     ) jt;
```
This query converts JSON data into relational columns.

### 5. JSON_OBJECT

**Purpose**: Constructs a JSON object from name-value pairs.

#### Example:
```sql
SELECT JSON_OBJECT('id' VALUE id, 'title' VALUE title, 'author' VALUE author) AS json_object
FROM json_table;
```
This query constructs a JSON object from the specified columns.

### 6. JSON_ARRAY

**Purpose**: Constructs a JSON array from SQL expressions.

#### Example:
```sql
SELECT JSON_ARRAY(id, title, author) AS json_array
FROM json_table;
```
This query constructs a JSON array from the specified columns.

### 7. JSON_OBJECTAGG

**Purpose**: Aggregates multiple rows into a JSON object.

#### Example:
```sql
SELECT JSON_OBJECTAGG(id VALUE json_data) AS json_agg
FROM json_table;
```
This query aggregates JSON data from multiple rows into a single JSON object.

### 8. JSON_ARRAYAGG

**Purpose**: Aggregates multiple rows into a JSON array.

#### Example:
```sql
SELECT JSON_ARRAYAGG(json_data) AS json_array
FROM json_table;
```
This query aggregates JSON data from multiple rows into a single JSON array.

### 9. JSON_TEXTCONTAINS

**Purpose**: Performs full-text search on JSON data.

#### Example:
```sql
CREATE INDEX json_context_idx ON json_table columns (json_data) INDEXTYPE 
IS CTXSYS.CONTEXT PARAMETERS ('SECTION GROUP CTXSYS.JSON_SECTION_GROUP');

SELECT id, json_data
FROM json_table
WHERE JSON_TEXTCONTAINS(json_data, 'science');
```
This query performs a full-text search for the word "science" in the JSON data.

These functions provide powerful tools for working with JSON data in Oracle Database, allowing you to extract, query, and manipulate JSON data efficiently. 

### Reference 
[JSON Developer's Guide](https://docs.oracle.com/en/database/oracle/oracle-database/21/adjsn/index.html
)