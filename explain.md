### Understanding and Using Probabilistic Data Structures in Redis


#### I. Deterministic and Probabilistic
**Definition:** Deterministic data structures provide precise and predictable results. Every operation on these data structures yields the same result every time, given the same input. They are used when exact data accuracy is required.

**Examples in Redis:**
- **Strings:** Store and retrieve exact string values.
- **Lists:** Maintain an ordered collection of elements.
- **Sets:** Store unique elements without any order.
- **Hashes:** Store field-value pairs.
- **Sorted Sets:** Store unique elements ordered by a score.

**Definition:** Probabilistic data structures provide approximate results, which are often sufficient for many applications. They trade off some accuracy for significant gains in space and time efficiency. These structures are useful for large-scale data processing where exact precision is not critical.

**Examples in Redis:**
- **Bloom Filter:** Checks for the presence of an item in a set with a possibility of false positives but no false negatives [1](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/).
- **Cuckoo Filter:** Similar to Bloom Filter but supports deletions [1](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/).
- **HyperLogLog:** Estimates the cardinality (number of unique elements) of a set [1](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/).
- **Count-Min Sketch:** Estimates the frequency of elements in a data stream [1](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/).
- **T-digest:** Estimates percentiles and quantiles in a data stream [1](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/).
- **TopK:** Identifies the most frequent items in a data stream [1](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/).

- <span>&#10004;</span> <!-- ✔ -->  Available in Redis cloud
- <span>&#10006;</span> <!-- ✖ -->  Unavailable in Redis cloud


#### II. Bloom Filter  <span>&#10004;</span> <!-- ✔ -->
**Description:** A Bloom Filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set. It can guarantee that an element is definitely not in the set, but it may produce false positives, meaning it might incorrectly indicate that an element is in the set when it is not. Bloom Filters are useful for applications like checking if a username is taken or if a user has seen an ad.

**Example:** Imagine you have a list of email addresses and you want to quickly check if an email has already been seen before.

**Usage:**
```shell
# Create a Bloom Filter with a capacity of 1000 and error rate of 0.1%
BF.RESERVE emails 0.001 1000

# Add an email to the Bloom Filter
BF.ADD emails "example@example.com"

# Check if an email is in the Bloom Filter
BF.EXISTS emails "example@example.com"  # Output: 1 (true)
BF.EXISTS emails "new@example.com"      # Output: 0 (false)
```
```javascript
const BloomFilter = require('bloom-filter');

// Create a Bloom Filter with a capacity of 1000 and error rate of 0.1%
const bloom = new BloomFilter(1000, 0.001);

// Add an email to the Bloom Filter
bloom.add('example@example.com');

// Check if an email is in the Bloom Filter
console.log(bloom.test('example@example.com'));  // Output: true
console.log(bloom.test('new@example.com'));      // Output: false (or true, but rarely)
```

**Documentation:** [Bloom Filter](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/), [Bloom Filter Calculator](https://hur.st/bloomfilter/)


#### III. Cuckoo Filter  <span>&#10004;</span> <!-- ✔ -->
**Description:** A Cuckoo Filter is similar to a Bloom Filter but supports deletion of elements. It uses multiple hash functions and an array of buckets to store fingerprints of elements. This structure allows for efficient membership tests and deletions, making it suitable for applications like validating discount codes or managing targeted ad campaigns.

**Example:** Suppose you have a list of discount codes and you want to check if a code is valid and also be able to remove expired codes.

**Usage:**
```shell
# Create a Cuckoo Filter with a capacity of 1000
CF.RESERVE discount_codes 1000

# Add a discount code to the Cuckoo Filter
CF.ADD discount_codes "DISCOUNT2025"

# Check if a discount code is in the Cuckoo Filter
CF.EXISTS discount_codes "DISCOUNT2025"  # Output: 1 (true)
CF.EXISTS discount_codes "EXPIRED2024"   # Output: 0 (false)

# Remove a discount code from the Cuckoo Filter
CF.DEL discount_codes "DISCOUNT2025"
CF.EXISTS discount_codes "DISCOUNT2025"  # Output: 0 (false)
```
```javascript
const CuckooFilter = require('cuckoo-filter');

// Create a Cuckoo Filter with a capacity of 1000
const cuckoo = new CuckooFilter(1000);

// Add a discount code to the Cuckoo Filter
cuckoo.add('DISCOUNT2025');

// Check if a discount code is in the Cuckoo Filter
console.log(cuckoo.contains('DISCOUNT2025'));  // Output: true
console.log(cuckoo.contains('EXPIRED2024'));   // Output: false

// Remove a discount code from the Cuckoo Filter
cuckoo.remove('DISCOUNT2025');
console.log(cuckoo.contains('DISCOUNT2025'));  // Output: false
```

**Documentation:** [Cuckoo Filter](https://redis.io/docs/latest/develop/data-types/probabilistic/cuckoo-filter/)


#### IV. HyperLogLog  <span>&#10004;</span> <!-- ✔ -->
**Description:** HyperLogLog is used to estimate the cardinality (the number of unique elements) of a set. It is highly space-efficient and can provide an approximate count with a standard error of 0.81%. This makes it ideal for applications like counting unique visitors to a website or unique queries in a search engine.

**Example:** You want to count the number of unique visitors to your website.

**Usage:**
```shell
# Add visitor IDs to HyperLogLog
PFADD visitors "user1" "user2" "user3"

# Estimate the number of unique visitors
PFCOUNT visitors  # Output: 3
```
```javascript
const redis = require('redis');
const client = redis.createClient();

// Add visitor IDs to HyperLogLog
client.pfadd('visitors', 'user1', 'user2', 'user3', (err, res) => {
  if (err) throw err;

  // Estimate the number of unique visitors
  client.pfcount('visitors', (err, count) => {
    if (err) throw err;
    console.log(count);  // Output: 3
  });
});
```

**Documentation:** [HyperLogLog](https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/)


#### V. Count-Min Sketch  <span>&#10006;</span> <!-- ✖ -->
**Description:** A Count-Min Sketch is used to estimate the frequency of elements in a data stream. It uses sub-linear space and can overestimate counts due to hash collisions. This structure is useful for applications like tracking the frequency of product sales or monitoring network traffic.

**Example:** You want to track the frequency of product sales in an online store.

**Usage:**
```shell
# Increment the count of product sales
CMS.INCRBY product_sales "productA" 5 "productB" 3

# Get the estimated count of product sales
CMS.QUERY product_sales "productA"  # Output: 5
CMS.QUERY product_sales "productB"  # Output: 3
```
```javascript
const redis = require('redis');
const client = redis.createClient();

// Increment the count of product sales
client.send_command('CMS.INCRBY', ['product_sales', 'productA', 5, 'productB', 3], (err, res) => {
  if (err) throw err;

  // Get the estimated count of product sales
  client.send_command('CMS.QUERY', ['product_sales', 'productA'], (err, countA) => {
    if (err) throw err;
    console.log(countA);  // Output: 5

    client.send_command('CMS.QUERY', ['product_sales', 'productB'], (err, countB) => {
      if (err) throw err;
      console.log(countB);  // Output: 3
    });
  });
});
```

**Documentation:** [Count-Min Sketch](https://redis.io/docs/latest/develop/data-types/probabilistic/count-min-sketch/)


#### VI. T-digest  <span>&#10006;</span> <!-- ✖ -->
**Description:** T-digest is a data structure for estimating percentiles and quantiles in a data stream. It is particularly useful for computing high-percentile values like the 99th percentile latency in a monitoring system. T-digest is efficient in terms of both space and computation.

**Example:** You want to compute the 99th percentile latency of requests to your server.

**Usage:**
```shell
# Add latency values to T-digest
TDIGEST.ADD latencies 100 200 300 400 500

# Get the 99th percentile latency
TDIGEST.QUANTILE latencies 0.99  # Output: 500 (approx.)
```
```javascript
const redis = require('redis');
const client = redis.createClient();

// Add latency values to T-digest
client.send_command('TDIGEST.ADD', ['latencies', 100, 200, 300, 400, 500], (err, res) => {
  if (err) throw err;

  // Get the 99th percentile latency
  client.send_command('TDIGEST.QUANTILE', ['latencies', 0.99], (err, quantile) => {
    if (err) throw err;
    console.log(quantile);  // Output: 500 (approx.)
  });
});
```

**Documentation:** [T-digest](https://redis.io/docs/latest/develop/data-types/probabilistic/t-digest/)


#### VII. TopK  <span>&#10004;</span> <!-- ✔ -->
**Description:** TopK is designed to identify and keep track of the most frequent items in a data stream. It uses a combination of hash tables and counters to maintain a list of the top-k elements. This is useful for applications like detecting the most popular items in a large dataset or monitoring the most frequent queries.

**Example:** You want to identify the most frequent search queries on your website.

**Usage:**
```shell
# Add search queries to TopK
TOPK.RESERVE search_queries 10
TOPK.ADD search_queries "query1" "query2" "query1" "query3" "query1"

# Get the top-k frequent search queries
TOPK.LIST search_queries  # Output: ["query1", "query2"]
```
```javascript
const redis = require('redis');
const client = redis.createClient();

// Add search queries to TopK
client.send_command('TOPK.ADD', ['search_queries', 'query1', 'query2', 'query1', 'query3', 'query1'], (err, res) => {
  if (err) throw err;

  // Get the top-k frequent search queries
  client.send_command('TOPK.LIST', ['search_queries'], (err, topK) => {
    if (err) throw err;
    console.log(topK);  // Output: ['query1', 'query2']
  });
});
```

**Documentation:** [TopK](https://redis.io/docs/latest/commands/?group=topk)

These descriptions, examples, usage in Node.js ES6 syntax, and updated documentation links should give you a comprehensive understanding of these probabilistic data structures in Redis. If you have any further questions or need more details, feel free to ask!


#### VIII. Bibliography 
1. [Understanding Probabilistic Data Structures with 112,092 UFO Sightings - Guy Royse - NDC Oslo 2023](https://youtu.be/M6XOniVANKI)
2. [Understanding Probabilistic Data Structures with 112,092 UFO Sightings By Guy Royse](https://youtu.be/qMp6jlxC238)


### EOF (2025/04/17)
