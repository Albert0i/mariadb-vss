###

#### Prologue 
I am a person of conservative by nature *not* by age. But when it comes to direct experiments, I am rather proactive to new technology. The motto is we must get merits and demerits of both ends so as to compromise an optimal solution whenever necessary. 


#### [MariaDB Vectors (MariaDB.org)](https://mariadb.org/projects/mariadb-vector)
- A project guided by the MariaDB Foundation, built with the MariaDB Server community. Main contributors – MariaDB Corporation, MariaDB Foundation, Amazon
- Enables fast vector search in a relational database.
- Keep your technology stack simple, no need for specialised datastores.

> There is a dedicated VECTOR data type and a specialized VECTOR index type. The indexing algorithm is a modified version of HNSW.
```
CREATE TABLE products (
    name varchar(128),
    description varchar(2000),
    embedding VECTOR(4) NOT NULL,  # Make sure the dimensions match your AI model's output
    VECTOR INDEX (embedding) M=6 DISTANCE=euclidean)
ENGINE=InnoDB;
```

Vector distance functions:
```
# Euclidean distance
VEC_DISTANCE_EUCLIDEAN(embedding, Vec_FromText('[0.1, 0.4, 0.5, 0.3, 0.2]'))
```

Utility vector functions:
```
VEC_FromText('[...]')  # JSON array of floats.
VEC_ToText(<vector-bytes>)
```

Insert vectors:
```
INSERT INTO products (name, description, embedding)
VALUES ('Coffee Machine',
        'Built to make the best coffee you can imagine',
        VEC_FromText('[0.3, 0.5, 0.2, 0.1]'))
```

Vector search:
```
SELECT p.name, p.description
FROM products AS p
ORDER BY VEC_DISTANCE_EUCLIDEAN(p.embedding,
                      VEC_FromText('[0.3, 0,5, 0.1, 0.3]'))
LIMIT 10
```

> The MariaDB optimizer is tuned to leverage the vector index if the SELECT query has an `ORDER BY` `VEC_DISTANC_EUCLIDEAN` (or `VEC_DISTANC_COSINE`) clause and a `LIMIT` clause.

> MariaDB Vector preview implements a modified version of Hierarchical Navigable Small Worlds ([HNSW](https://arxiv.org/ftp/arxiv/papers/1603/1603.09320.pdf)) algorithm. The search performance is comparable with other vector search implementations and surpasses in scalability when multiple connections are used.

![alt Single-threaded-query-performance](img/Single-threaded-query-performance.JPG)

![alt Multi-threaded-query-performance](img/Multi-threaded-query-performance.JPG)

---

When recall is on the x-axis and queries per second (QPS) is on the y-axis, the graph typically indicates the relationship between the accuracy of a search or retrieval system and its performance in terms of speed. The recall values are:0.9, 0.99, 0.999 and 0.9999 here. 

- **Recall**: Measures the proportion of relevant items that are successfully retrieved. Higher recall means more relevant items are found.
- **Queries Per Second (QPS)**: Indicates the number of queries the system can handle per second. Higher QPS means the system can process more queries in a given time.

- **High Recall, Low QPS**: The system is accurate but slower, possibly due to more complex or thorough search algorithms.
- **Low Recall, High QPS**: The system is faster but less accurate, possibly due to simpler or less thorough search algorithms.
- **Balanced Recall and QPS**: The system maintains a good balance between accuracy and speed.

This graph helps in understanding the trade-offs between the accuracy of the search results and the performance of the system. It can be useful for optimizing search algorithms to achieve the desired balance based on specific requirements.

---

A full benchmark set is available at:
[How Fast Is MariaDB Vector?](https://mariadb.com/resources/blog/how-fast-is-mariadb-vector/)


#### [MariaDB Vectors (MariaDB.com)](https://mariadb.com/kb/en/vectors/)


#### Bibliography
1. [MariaDB Vectors (MariaDB.org)](https://mariadb.org/projects/mariadb-vector)
1. [MariaDB Vectors (MariaDB.com)](https://mariadb.com/kb/en/vectors/)
1. [AI first applications with MariaDB Vector - Vicentiu Ciorbaru](https://youtu.be/vp126N1QOws)
1. [Get to know MariaDB’s Rocket-Fast Native Vector Search - Sergei Golubchyk](https://youtu.be/gNyzcy_6qJM)


#### Epilogue 


### EOF (2025/04/01)
