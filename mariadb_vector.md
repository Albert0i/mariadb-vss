### [MariaDB Community Server 11.7 RC with Vector Search](https://mariadb.com/resources/blog/announcing-mariadb-community-server-11-7-rc-with-vector-search-and-11-6-ga/)

**Vector Search**

After [announcing the preview of vector search in MariaDB Server](https://mariadb.com/resources/blog/mariadb-vector-preview-is-out/), the vector search capability has now been added to the MariaDB Community Server 11.7 release. The linked blog post explains the idea of the new vector search feature in detail, based on the implementation of the preview release.

**Vector Embeddings**

Vector embeddings are numerical representations [0.2, -0.5, 0.8, 0.1, …] that capture semantic meaning or features of data in a multi-dimensional space. The embedding transforms simple to complex data such as text, images, audio, or video into a series of numbers (a vector) where similar items are positioned together in the multi-dimensional vector space.

For example, a word embedding of the word “dog” would be close in a vector embedding space to the word “puppy”, whereas “dog” would not be close to the word “airplane”. The embedding representation can be used in similarity search, recommendation systems, or more generally in traditional AI/ML systems and GenAI systems.

**New Data Type VECTOR()**

With the RC release a new data type VECTOR(N) has been added to represent the vector column.
Example:
```
CREATE TABLE myVectorSearch (
    id INT PRIMARY KEY,
    v VECTOR(3) NOT NULL,
    VECTOR INDEX (v)
);
```

**Conversion Functions**

The two conversion functions [VEC_FromText](https://mariadb.com/kb/en/vec_fromtext/) and [VEC_ToText](https://mariadb.com/kb/en/vec_totext/) can be used to:

- Convert a binary vector (little-endian IEEE float format) into a json array of numbers
- Convert a json array of numbers into a little-endian IEEE float sequence of bytes (4 bytes per float)
Example:
```
INSERT INTO myVectorSearch VALUES (1, Vec_FromText('[1,2,3]'));

SELECT Vec_ToText(v) from myVectorSearch;
```

**Comparison Functions**

Comparing vectors, calculating how close they are, is the key functionality needed by an application working with vector search. MariaDB Community Server 11.7 provides two functions for calculating the distance between vectors. Which one to use depends on the application and on how the vectors were generated.

[VEC_DISTANCE_EUCLIDEAN()](https://mariadb.com/kb/en/vec_distance_euclidean/) Takes two vectors and computes the straight line (L2) Euclidean distance between two multi-dimensional points in vector space
[VEC_DISTANCE_COSINE()](https://mariadb.com/kb/en/vec_distance_cosine/) Measures the cosine distance between two vectors in a multi-dimensional vector space
Example:
```
SELECT id FROM myVectorSearch ORDER BY VEC_DISTANCE__EUCLIDEAN(v, Vec_FromText('[2,4,6]')) LIMIT 5;t

SELECT id FROM myVectorSearch ORDER BY VEC_DISTANCE_COSINE(v, Vec_FromText('[2,4,6]')) LIMIT 5;
```

```
select VEC_DISTANCE_EUCLIDEAN(Vec_FromText('[1.1, 1.2, 1.3, 1.4, 1.5]'), 
                              Vec_FromText('[1.1, 1.2, 1.3, 1.5, 1.6]'));  

select VEC_DISTANCE_COSINE(Vec_FromText('[1.1, 1.2, 1.3, 1.4, 1.5]'), 
                           Vec_FromText('[1.1, 1.2, 1.3, 1.5, 1.6]'));  

select (1- VEC_DISTANCE_COSINE(Vec_FromText('[1.1, 1.2, 1.3, 1.4, 1.5]'), 
                           Vec_FromText('[1.1, 1.2, 1.3, 1.5, 1.6]'))) as cosine_similarity; 
```

**Configuration Options**

The vector search feature requires some new system variables for controlling the general behavior. Four new system variables have been added

- [mhnsw_max_cache_size](https://mariadb.com/kb/en/vector-system-variables/#mhnsw_max_cache_size) Upper limit for one MHNSW vector index cache
- [mhnsw_default_distance](https://mariadb.com/kb/en/vector-system-variables/#mhnsw_default_distance) Default value for the DISTANCE vector index option
- [mhnsw_default_m](https://mariadb.com/kb/en/vector-system-variables/#mhnsw_default_m) Default value for the M vector index option
- [mhnsw_ef_search](https://mariadb.com/kb/en/vector-system-variables/#mhnsw_ef_search) Defines the minimal number of result candidates to look for in the vector index for ORDER BY … LIMIT N queries.

If you are interested in initial benchmark results of vector search done with the preview release, this can be found in [this blog](https://mariadb.com/resources/blog/how-fast-is-mariadb-vector/). Blog posts covering new benchmarks and AI Frameworks like LLamaIndex and Spring AI will be published in the coming weeks.

