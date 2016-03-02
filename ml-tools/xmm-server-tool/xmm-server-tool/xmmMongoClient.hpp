//
//  xmmMongoClient.hpp
//  xmm-lib
//
//  Created by Joseph Larralde on 09/02/16.
//
//

#ifndef xmmMongoClient_hpp
#define xmmMongoClient_hpp

#include <cstdlib>
#include <iostream>

#include <thread>
#include <mutex>

extern "C" {
#include <bson.h>
#include <bcon.h>
#include <mongoc.h>
}

#include "xmm.h"

#ifdef XMM_MONGO_THREAD
#undef XMM_MONGO_THREAD
#endif
//#define XMM_MONGO_THREAD

/*
typedef struct {
    mongoc_client_pool_t *pool;
    std::string output;
}
workerdata_t;
*/

typedef enum { XmmMongoGet = 0, XmmMongoSet } XmmMongoTaskE;

class xmmMongoThread;

class xmmMongoClient {
    
    //http://api.mongodb.org/c/current/mongoc_client_pool_t.html
    // for thread-safe multiple read-write operations

public:
    mongoc_client_pool_t *pool;
    std::mutex mtx;
    
private:
    
#ifdef XMM_MONGO_THREAD
    const char          *uristr = "mongodb://127.0.0.1:27017/?minPoolSize=16";
    mongoc_uri_t        *uri;
    std::vector<pthread_t> threads;
    std::vector<xmmMongoThread> xmts;
#else
    //*
    mongoc_client_t     *client;
    mongoc_database_t   *database;
    mongoc_collection_t *collection;
    mongoc_cursor_t     *cursor;
    bson_error_t        error;
    const bson_t        *doc;
    //*/
    const char          *uristr = "mongodb://127.0.0.1:27017/";
    const char          *db_name = "test";
    const char          *collection_name = "test";
    
    bson_t              *command,
                        reply,
                        *insert,
                        *query;
    
    char                *str;
    bool                retval;
#endif
    /*
    mongoc_init ();
    
    if (argc > 1) {
        uristr = argv [1];
    }
    
    if (argc > 2) {
        collection_name = argv [2];
    }
    
    client = mongoc_client_new (uristr);
    
    if (!client) {
        fprintf (stderr, "Failed to parse URI.\n");
        return EXIT_FAILURE;
    }
    
    database = mongoc_client_get_database(client, db_name);
    collection = mongoc_client_get_collection(client, db_name, collection_name);
    
    command = BCON_NEW("ping", BCON_INT32(1));
    retval = mongoc_client_command_simple(client, "admin", command, NULL, &reply, &error);
    if(!retval) {
        fprintf(stderr, "%s\n", error.message);
        return EXIT_FAILURE;
    }
    
    str = bson_as_json(&reply, NULL);
    printf("%s\n", str);
    
    insert = BCON_NEW("hello", BCON_UTF8("world"));
    if(!mongoc_collection_insert(collection, MONGOC_INSERT_NONE, insert, NULL, &error)) {
        fprintf(stderr, "%s\n", error.message);
    }
    
    bson_destroy(insert);
    bson_destroy(&reply);
    bson_destroy(command);
    bson_free(str);
    
    //release handles and cleanup mongodb
    mongoc_collection_destroy(collection);
    mongoc_database_destroy(database);
    mongoc_client_destroy(client);
    
    mongoc_cleanup();
    */
    
public:
    xmmMongoClient() {}
    ~xmmMongoClient() {}
    
    int connect();
    int close();
    
#ifdef XMM_MONGO_THREAD
    int work();
    int wait();
#else
    std::vector<std::string> task(XmmMongoTaskE t, std::vector<std::string> args = std::vector<std::string>(0));
    std::vector<std::string> fetchPhrases(std::string db, std::string srcColl,
                                          std::vector<std::string> labels = std::vector<std::string>(0),
                                          std::vector<std::string> colnames = std::vector<std::string>(0));
#endif
    
    int writeModelsToDatabase(std::string db, std::string dstColl, std::string jsonString);
    
    //int getLabel(std::string label);
    
    //void setSearchPattern(std::vector<std::string> labels, std::vector<std::string> colnames);
};

// =================================================== //

class xmmMongoThread {
    
    std::thread t;
    pthread_t pt;
    
public:
    xmmMongoThread(xmmMongoClient mc) {
        client = &mc;
    }
    
    ~xmmMongoThread() {
        stop();
    }
    
    static void *threaded_function(void *data) { return NULL; }
    void start();
    void stop();
    void join();
    
    xmmMongoClient *client;
};


#endif /* xmmMongoClient_hpp */
