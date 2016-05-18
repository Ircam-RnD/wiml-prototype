//
//  xmmMongoClient.cpp
//  xmm-lib
//
//  Created by Joseph Larralde on 09/02/16.
//
//

#include "xmmMongoClient.hpp"

// NOT USED FOR THE MOMENT -> check C++11 std::thread and std::mutex types instead

void
xmmMongoThread::start() {
    pthread_create(&pt, NULL, &xmmMongoThread::threaded_function, client->pool);
}

void
xmmMongoThread::stop() {
    
}

void
xmmMongoThread::join() {
    
}

// ================================================= //

#ifdef XMM_MONGO_THREAD

static void *
worker(void *data) {
    //mongoc_client_pool_t *pool = ((workerdata_t *)data)->pool;
    mongoc_client_pool_t *pool = (mongoc_client_pool_t *)data;
    //std::string output = ((workerdata_t *)data)->output;
    
    mongoc_client_t *client;
    mongoc_collection_t *collection;
    mongoc_cursor_t *cursor;
    const bson_t *doc;
    bson_t *query;
    char *str;
    
    //do {
    client = mongoc_client_pool_pop(pool);
    
    collection = mongoc_client_get_collection (client, "phrases", "phrases");
    query = bson_new ();
    cursor = mongoc_collection_find (collection, MONGOC_QUERY_NONE, 0, 0, 0, query, NULL, NULL);
    
    while (mongoc_cursor_next (cursor, &doc)) {
        str = bson_as_json (doc, NULL);
        //printf ("%s\n", str);
        std::cout << str << std::endl;
        bson_free (str);
    }
    
    bson_destroy (query);
    mongoc_cursor_destroy (cursor);
    mongoc_collection_destroy (collection);
    
    mongoc_client_pool_push(pool, client);
    //} while(!inShutDown);
    
    return NULL;
}

int
xmmMongoClient::work()
{
    pthread_t pt;
    threads.push_back(pt);
    pthread_create(&(threads[threads.size()]), NULL, worker, pool);
    return 0;
}

int
xmmMongoClient::wait()
{
    pthread_join(threads[threads.size()], NULL);
    std::cout << "thread ended" << std::endl;
    return 0;
}

#else

// NOT USED ANYMORE ?
/*
std::vector<std::string>
xmmMongoClient::task(XmmMongoTaskE t, std::vector<std::string> args)
{
    std::vector<std::string> res;

    switch(t) {
        case XmmMongoGet:
            
            collection = mongoc_client_get_collection(client, "wimldb", "phrases");
            query = BCON_NEW ("$query", "{",
                                //"label", BCON_UTF8("Walk"),
                                "column_names", "{", "$all", "[", BCON_UTF8("magnitude"), BCON_UTF8("frequency"), BCON_UTF8("periodicity"), "]", "}",
                              "}");

            cursor = mongoc_collection_find(collection, MONGOC_QUERY_NONE, 0, 0, 0, query, NULL, NULL);
            
            while(mongoc_cursor_next(cursor, &doc)) {
                str = bson_as_json(doc, NULL);
                //std::cout << str << std::endl;
                res.push_back(std::string(str));
                bson_free(str);
            }
            
            bson_destroy(query);
            mongoc_cursor_destroy(cursor);
            mongoc_collection_destroy(collection);
            
        default:
            break;
    }

    return res;
}
*/

#endif

std::vector<std::string>
xmmMongoClient::fetchPhrases(std::string db, std::string coll, std::vector<std::string> labels, std::vector<std::string> colnames)
{
    
//================= working perfectly
    Json::Value jquery;
    Json::Value jsubquery;
    Json::Value labs;
    Json::Value inlabs;
    Json::Value lnames(Json::arrayValue);
    if(labels.size() > 0) {
        for(int i=0; i<labels.size(); i++) {
            lnames[i] = labels[i];
        }
        inlabs["$in"] = lnames;
        jsubquery["label"] = inlabs;
    }
    
    Json::Value allcols;
    Json::Value cnames(Json::arrayValue);
    for(int i=0; i<colnames.size(); i++) {
        cnames[i] = colnames[i];
    }
    allcols["$all"] = cnames;
    jsubquery["column_names"] = allcols;
    
    jquery["$query"] = jsubquery;
    
    Json::FastWriter fw;
    std::string squery = fw.write(jquery);
    
//================ working but not flexible
//    query = BCON_NEW ("$query", "{",
//                      //"label", BCON_UTF8("Walk"),
//                      "column_names", "{", "$all", "[", BCON_UTF8("magnitude"), BCON_UTF8("frequency"), BCON_UTF8("periodicity"), "]", "}",
//                      "}");

//================= not working
//    bson_t *subdoc;
//    bson_t *subdoc2;
//    bson_t *array;
//    bson_t *query;
//    
//    bson_init(query);
//
//    BSON_APPEND_DOCUMENT_BEGIN(query, "$query", subdoc);
//    BSON_APPEND_DOCUMENT_BEGIN(subdoc, "column_names", subdoc2);
//    BSON_APPEND_ARRAY_BEGIN(subdoc2, "$all", array);
//    for(int i=0; i<colnames.size(); i++) {
//        BSON_APPEND_UTF8(array, std::to_string(i).c_str(), colnames[i].c_str());
//    }
//    bson_append_array_end(subdoc2, array);
//    bson_append_document_end(subdoc2, subdoc);
//    bson_append_document_end(query, subdoc);
    
    std::vector<std::string> res;
    
    collection = mongoc_client_get_collection(client, db.c_str(), coll.c_str());
    
    bson_error_t error;
    const char *json = squery.c_str();
    query = bson_new_from_json((const uint8_t *)json, -1, &error);
    
    if(!query) {
        std::cerr << error.message << std::endl;
        res.push_back(error.message);
        return res;
    }
    
    cursor = mongoc_collection_find(collection, MONGOC_QUERY_NONE, 0, 0, 0, query, NULL, NULL);
    
    while(mongoc_cursor_next(cursor, &doc)) {
        str = bson_as_json(doc, NULL);
        res.push_back(std::string(str));
        bson_free(str);
    }
    
    bson_destroy(query);
    mongoc_cursor_destroy(cursor);
    mongoc_collection_destroy(collection);
    
    return res;
}

int
xmmMongoClient::writeModelsToDatabase(std::string db, std::string dstColl, std::string jstring)
{
    collection = mongoc_client_get_collection(client, db.c_str(), dstColl.c_str());
    
    bson_error_t error;
    bson_t *bson;
    //char *str;
    
    const char *json = jstring.c_str();
    bson = bson_new_from_json((const uint8_t *)json, -1, &error);
    
    if(!bson) {
        std::cerr << error.message << std::endl;
        return EXIT_FAILURE;
    }
    
    if(!mongoc_collection_insert(collection, MONGOC_INSERT_NONE, bson, NULL, &error)) {
        std::cerr << error.message << std::endl;
    }
    
    bson_destroy(bson);
    mongoc_collection_destroy(collection);
    return EXIT_SUCCESS;
}

int
xmmMongoClient::connect()
{
    mongoc_init();
#ifdef XMM_MONGO_THREAD
    uri = mongoc_uri_new(uristr);
    pool = mongoc_client_pool_new(uri);
#else
    client = mongoc_client_new(uristr);
#endif
    
    return 0;
}

int
xmmMongoClient::close()
{
#ifdef XMM_MONGO_THREAD
    mongoc_client_pool_destroy(pool);
    mongoc_uri_destroy(uri);
#else
    /*
    bson_destroy(insert);
    bson_destroy(&reply);
    bson_destroy(command);
    bson_free(str);
    */
    mongoc_client_destroy(client);
#endif
    mongoc_cleanup();
    
    return 0;
}