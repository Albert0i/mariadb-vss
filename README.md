### MariaDB Vector Semantic Search 

#### Prologue 
I am a person of conservative by nature *not* by age. But when it comes to direct experiments, I am rather proactive to new technology. The motto is we must get merits and demerits of both ends so as to compromise an optimal solution whenever necessary. 


#### I. Short intro written by copilot
Both [MySQL Community Server 9.2.0 Innovation](https://dev.mysql.com/downloads/mysql/) and [MariaDB Community Server Version 11.7.2-GA](https://mariadb.com/downloads/) offer robust vector capabilities, making either a good choice for testing Vector Semantic Search (VSS). However, here are a few considerations to help you decide:

**MariaDB Community Server 11.7.2-GA**

- **Focus on Vector Capabilities**: MariaDB has a strong emphasis on vector search capabilities, with specific functions and indexing methods designed for efficient vector operations.
- **Compatibility**: If you are already using MariaDB or prefer its ecosystem, this version would integrate seamlessly with your existing setup.

**MySQL Community Server 9.2.0**

- **Innovation and AI Integration**: MySQL's latest version also supports vector capabilities and is known for its innovation and integration with AI functionalities.
- **Wider Adoption**: MySQL has a larger user base and community support, which might be beneficial if you need extensive resources and community-driven solutions.

**Recommendation**

If your primary goal is to test and explore vector semantic search capabilities with a focus on performance and specific vector functions, **MariaDB Community Server 11.7.2-GA** might be the better choice due to its dedicated features. However, if you are looking for broader AI integration and community support, **MySQL Community Server 9.2.0** is also a strong contender.


#### II. [Old dog new tricks](https://dictionary.cambridge.org/dictionary/english/you-can-t-teach-an-old-dog-new-tricks)
I have been using MySQL Community Server 8.0.30 and quit happy with performance it gives. The obvious reason drives me to MariaDB is because I don't want to be blackmailed in huge amount of bucks by some company some day... It is just unwholesome to develop under psychology menace... 

MariaDB 11.7 introduces vector search capabilities, including the new [VECTOR](https://mariadb.com/kb/en/vector-overview/) data type and specialized vector indexes[1](https://mariadb.org/projects/mariadb-vector/). However, the supported distance functions are **Euclidean** and **Cosine**. Dot product distance is not explicitly mentioned as a supported function in the current release.

**Vector semantic search**
```
CREATE OR REPLACE TABLE vec_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document TEXT(1024) NOT NULL,
    embedding VECTOR(5),

    FULLTEXT (document)
);
insert into vec_items(document, embedding) values('document1.doc', Vec_FromText('[1.1, 1.2, 1.3, 1.4, 1.5]'));
insert into vec_items(document, embedding) values('document2,docx', Vec_FromText('[1.1, 1.2, 1.4, 1.5, 1.6]'));
insert into vec_items(document, embedding) values('Sheet.xls', Vec_FromText('[1.1, 1.3, 1.3, 1.4, 1.5]'));
insert into vec_items(document, embedding) values('Sheet.xlsx', Vec_FromText('[1.1, 1.3, 1.5, 1.6, 1.7]'));

select * from vec_items;

select id, document, Vec_ToText(embedding) from vec_items; 

select (1-VEC_DISTANCE_COSINE((select embedding from vec_items where id=1), 
                              (select embedding from vec_items where id=2))) as COSINE_SIMILARITY; 

select id, document, (1-VEC_DISTANCE_COSINE(Vec_FromText('[1.1, 1.1, 1.1, 1.1, 1.1]'), 
                                            embedding)) as COSINE_SIMILARITY
from vec_items
order by COSINE_SIMILARITY DESC;
```

#### 
```
DELIMITER //

CREATE OR REPLACE FUNCTION VEC_DISTANCE_DOT_PRODUCT(vector1 TEXT, 
                                                    vector2 TEXT) RETURNS FLOAT
BEGIN
    DECLARE v1 FLOAT;
    DECLARE v2 FLOAT;
    DECLARE dot_product_result FLOAT DEFAULT 0;
    DECLARE i INT DEFAULT 1;
    DECLARE len INT;

    SET len = LENGTH(vector1) - LENGTH(REPLACE(vector1, ',', '')) + 1;

    WHILE i <= len DO
        SET v1 = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(vector1, ',', i), ',', -1) AS FLOAT);
        SET v2 = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(vector2, ',', i), ',', -1) AS FLOAT);
        SET dot_product_result = dot_product_result + (v1 * v2);
        SET i = i + 1;
    END WHILE;

    RETURN dot_product_result;
END //

DELIMITER ;


DELIMITER //

CREATE FUNCTION VEC_DISTANCE_HAMMING(str1 TEXT, str2 TEXT) RETURNS INT
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE len INT;
    DECLARE distance INT DEFAULT 0;

    SET len = LENGTH(str1);

    WHILE i <= len DO
        IF SUBSTRING(str1, i, 1) != SUBSTRING(str2, i, 1) THEN
            SET distance = distance + 1;
        END IF;
        SET i = i + 1;
    END WHILE;

    RETURN distance;
END //

DELIMITER ;
```

```
select id, document, (1-VEC_DISTANCE_COSINE(Vec_FromText('[1.1, 1.1, 1.1, 1.1, 1.1]'), 
                                            embedding)) as COSINE_SIMILARITY, 
                     (VEC_DISTANCE_EUCLIDEAN(Vec_FromText('[1.1, 1.1, 1.1, 1.1, 1.1]'), 
                                             embedding)) as L2_DISTANCE,
                     (VEC_DISTANCE_EUCLIDEAN(Vec_FromText('[1.1, 1.1, 1.1, 1.1, 1.1]'), 
                                             embedding)) as DOT_PRODUCT_DISTANCE,
                     (VEC_DISTANCE_EUCLIDEAN(Vec_FromText('[1.1, 1.1, 1.1, 1.1, 1.1]'), 
                                             embedding)) as HAMMING_DISTANCE
from vec_items
order by COSINE_SIMILARITY DESC;
```

#### 
**Full text search**
```
select * from vec_items 
where MATCH(document) AGAINST('DOC' IN NATURAL LANGUAGE MODE);

select * from vec_items 
where document like 'doc%'; 
```

#### 
1. [Announcing MariaDB Community Server 11.7 RC with Vector Search and 11.6 GA](https://mariadb.com/resources/blog/announcing-mariadb-community-server-11-7-rc-with-vector-search-and-11-6-ga/)
1. [MariaDB Vector Overview](https://mariadb.com/kb/en/vector-overview/)
1. [MariaDB Vector](https://mariadb.org/projects/mariadb-vector/)
1. [How Fast Is MariaDB Vector?](https://mariadb.com/resources/blog/how-fast-is-mariadb-vector/)
1. [Download MariaDB 11.7.2-GA](https://dlm.mariadb.com/4181751/MariaDB/mariadb-11.7.2/winx64-packages/mariadb-11.7.2-winx64.msi)


#### Epilogue 


### EOF (2025/04/01)
