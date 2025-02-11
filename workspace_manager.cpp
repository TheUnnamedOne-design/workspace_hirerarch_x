#include<iostream>
#include<bits/stdc++.h>
#include<conio.h>
#include<climits>
#include<ctime>

using namespace std;
class Workspace;
class Resources;
class Tasks;
class Shared_Bucket;
class Roles;
class Shared_Workspace;
class Private_Workspace;
class Public_Workspace;
class User;
class Permissions;
class SharedBucket;
class Private_Bucket;
class Public_Bucket;
static unordered_map<string,Workspace*> all_workspaces;
static unordered_map<string,Shared_Bucket*> all_shared_buckets; 
static unordered_map<string,Private_Bucket*> all_private_buckets; 
static unordered_map<string,Public_Bucket*> all_public_buckets; 

static vector<string> all_ids;

static int sharedval=0;

long long budget;
static vector<Resources*> allresources;


string encrypt(string text, int key) {
    string result = "";
    for (char c : text) {
        result += (char)(c + key); // Shift every character forward
    }
    return result;
}

// Function to decrypt a string
string decrypt(string encrypted_text, int key) {
    string result = "";
    for (char c : encrypted_text) {
        result += (char)(c - key); // Shift every character back
    }
    return result;
}

class Shared_Bucket
{

    vector<Workspace*> allowed;
    int bbudget;
    public:
    string name;
    vector<Resources*> free_to_use;

    void setInfo(vector<Workspace*> v,int b,vector<Resources*> res)
    {
        vector<Workspace*>::iterator it=v.begin();
        while(it!=v.end())
        {
            allowed.push_back(*it);
            it++;
        }
        bbudget=b;
        budget-=b;

        vector<Resources*>::iterator ir=res.begin();

        while(ir!=res.end())
        {
            free_to_use.push_back(*ir);
            ir++;
        }

    }

    vector<Resources*> get_resources(Workspace *ws,int n)
    {
        int si=free_to_use.size();

        vector<Resources*> ans={};

        int i;
        for(i=0;i<allowed.size();i++)
        {
            if(ws==allowed[i]) 
            {
                goto here;
            }
        }
        cout<<"Workspace not permitted to access current Bucket!";
        return ans;

        here:
        for(i=0;i<n;i++)
        {
            Resources *r=free_to_use.back();
            ans.push_back(r);
            free_to_use.pop_back();
        }
        cout<<"Workspace permitted to access current Bucket.";
        return ans;
    }

    void add_resources(vector<Resources*> v)
    {
        vector<Resources*>::iterator it=v.begin();

        while(it!=v.end())
        {
            free_to_use.push_back(*it);
            it++;
        }

    }

    void free_Bucket()
    {
        budget+=bbudget;
        delete this;
    }

};


class Public_Bucket
{

    int bbudget;
    public:
    string name;
    vector<Resources*> free_to_use;

    void setInfo(int b,vector<Resources*> res)
    {

        bbudget=b;
        budget-=b;

        vector<Resources*>::iterator ir=res.begin();

        while(ir!=res.end())
        {
            free_to_use.push_back(*ir);
            ir++;
        }

    }

    vector<Resources*> get_resources(Workspace *ws,int n)
    {
        int si=free_to_use.size();

        vector<Resources*> ans={};

        int i;

        for(i=0;i<n;i++)
        {
            Resources *r=free_to_use.back();
            ans.push_back(r);
            free_to_use.pop_back();
        }
        cout<<"Workspace permitted to access current Bucket.";
        return ans;
    }

    void add_resources(vector<Resources*> v)
    {
        vector<Resources*>::iterator it=v.begin();

        while(it!=v.end())
        {
            free_to_use.push_back(*it);
            it++;
        }

    }

    void free_Bucket()
    {
        budget+=bbudget;
        delete this;
    }

};

class Private_Bucket
{
    Workspace *allowed;
    int bbudget;
    public:
    string name;
    vector<Resources*> free_to_use;

    void setInfo(Workspace *v,int b,vector<Resources*> res)
    {
        
        allowed=v;

        bbudget=b;
        budget-=b;

        vector<Resources*>::iterator ir=res.begin();

        while(ir!=res.end())
        {
            free_to_use.push_back(*ir);
            ir++;
        }

    }

    vector<Resources*> get_resources(Workspace *ws,int n)
    {
        int si=free_to_use.size();

        vector<Resources*> ans={};

        int i;
        if(ws==allowed) goto here;

        cout<<"Workspace not permitted to access current Bucket!";
        return ans;

        here:
        for(i=0;i<n;i++)
        {
            Resources *r=free_to_use.back();
            ans.push_back(r);
            free_to_use.pop_back();
        }
        cout<<"Workspace permitted to access current Bucket.";
        return ans;
    }

    void add_resources(vector<Resources*> v)
    {
        vector<Resources*>::iterator it=v.begin();

        while(it!=v.end())
        {
            free_to_use.push_back(*it);
            it++;
        }

    }

    void free_Bucket()
    {
        budget+=bbudget;
        delete this;
    }

};

class Workspace
{
    private:
    list<Tasks*> tasks;
    list<Permissions*> permissions;
    string encrypted_key;
    list<User*> users;
    
    protected:
    vector<Workspace*> child_w;
    vector<Workspace*> parent_w;
    int sign;
    public:
    string signature;
    
    void assignparent(Workspace *p)
    {
        (this->parent_w).push_back(p);
    }
    
    void assignchild(Workspace *p)
    {
        (this->child_w).push_back(p);
    }

    string id;
    int idno;
    string wname;

    void display_info()
    {
        cout<<"Child Workspaces : ";
        vector<Workspace*>::iterator it=child_w.begin();
        
        while(it!=child_w.end())
        {
            cout<<(*it)->id<<" ";
            it++;
        }
        cout<<endl;
        
        
        cout<<"Parent Workspaces : ";
        it=parent_w.begin();
        
        while(it!=parent_w.end())
        {
            cout<<(*it)->id<<" ";
            it++;
        }
        cout<<endl;

        cout<<"Current Workspace : "<<id<<endl<<endl;
    }

    string getWorkspaceId()
    {
        return encrypted_key;
    }

    void updateInfo()
    {
        string assign_id="(";
        vector<Workspace*>::iterator it=parent_w.begin();
        while(it!=parent_w.end())
        {
            assign_id+=(*it)->id+"|";
            it++;
        }
        assign_id+=")";

        string cid=to_string(idno);
        assign_id+="->"+cid;

        string encr=encrypt(assign_id,5);
        encrypted_key=encr;
        id=assign_id;

        all_ids.push_back(encr);
        all_workspaces[encr]=this;
    }
    
};

class Shared_Workspace: public Workspace
{
    public:
    list<User*> users;
    Shared_Bucket *bucket;

    Shared_Workspace()
    {
        signature="Shared";
        sign=0;
        idno=sharedval;
        updateInfo();
        sharedval++;
    }

    void assign_bucket(string s)
    {

    }

};

class Private_Workspace: public Workspace
{
    public:
    list<User*> users;
    Private_Workspace()
    {
        signature="Private";
        sign-1;
        idno=sharedval;
        updateInfo();
        sharedval++;
    }

    
};


class Public_Workspace: public Workspace
{
    public:
    list<User*> users;
    Public_Workspace()
    {
        signature="Public";
        sign=2;
        idno=sharedval;
        updateInfo();
        sharedval++;
    }
    
    
};

Workspace *createshared()
{
    Workspace *obj=new Shared_Workspace();
    return obj;
}


Workspace *createprivate()
{
    Workspace *obj=new Private_Workspace();
    return obj;
}
Workspace *createpublic()
{
    Workspace *obj=new Public_Workspace();
    return obj;
}




Workspace *createWorkspace()
{
    cout << "Enter workspace name: ";
    string name;
    //string name="ws"+to_string(sharedval);
    cin >> name;

    cout << "Enter workspace type:\n";
    cout << "1. Public\n";
    cout << "2. Private\n";
    cout << "3. Shared\n";

    int key;
    cin>>key;
    Workspace *ws = nullptr;

    switch (key)
    {
        case 1:
            ws = createpublic();
            break;
        case 2:
            ws = createprivate();
            break;
        case 3:
            ws = createshared();
            break;
        default:
            cout << "Invalid type! Workspace not created.\n";
            return nullptr;
    }

    string holder="end";
    cout << "Enter IDs of parent workspaces (type 'end' to stop): \n";

    while (true)
    {
        cin>>holder;
        if (holder == "end") break;

        
        if (all_workspaces.find(holder) == all_workspaces.end())
        {
            cout << "Invalid ID: " << holder << ". Skipping...\n";
            continue;
        }

        ws->assignparent(all_workspaces[holder]);
    }


    cout << "Enter IDs of child workspaces (type 'endc' to stop): \n";

    while (true)
    {
        cin>>holder;
        if (holder == "endc") break;

        
        if (all_workspaces.find(holder) == all_workspaces.end())
        {
            cout << "Invalid ID: " << holder << ". Skipping...\n";
            continue;
        }

        ws->assignchild(all_workspaces[holder]);
    }

    cout << "Workspace created successfully!\n";
    cout << "Workspace ID: " << ws->getWorkspaceId() << "\n\n";

    return ws;
}


void Workspace_access(string id)
{
    Workspace *ws=all_workspaces[id];
}


string generateRandomString(int length) {
    const string characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                              "abcdefghijklmnopqrstuvwxyz"
                              "0123456789"
                              "!@#$%^&*()-_=+[]{}|;:,.<>?";

    string randomString = "";
    int charSize = characters.size();

    srand(time(0)); 

    for (int i = 0; i < length; i++) {
        randomString += characters[rand() % charSize];
    }

    return randomString;
}

Shared_Bucket *createsharedbucket()
{
    Shared_Bucket *obj=new Shared_Bucket();
    string key=generateRandomString(16);
    obj->name=key;
    all_shared_buckets[key]=obj;
    return obj;
}

Private_Bucket *createprivatebucket()
{
    Private_Bucket *obj=new Private_Bucket();
    string key=generateRandomString(16);
    obj->name=key;
    all_private_buckets[key]=obj;
    return obj;
}

Public_Bucket *createpublicbucket()
{
    Public_Bucket *obj=new Public_Bucket();
    string key=generateRandomString(16);
    obj->name=key;
    all_public_buckets[key]=obj;
    return obj;
}

class Tasks
{
    int priority;
    int time;

};

class Resources
{
    public:
    string s;
    Resources()
    {
        s="resource";
    }
};

class User
{
    private:
    list<Workspace*> user_workspaces;
};

Resources *allocateresource()
{
    Resources *obj=new Resources();
    return obj;
}

void allot_company_resources()
{
    int i;
    for(i=0;i<1000000;i++)
    {
        allresources.push_back(allocateresource());
    }
}

int main()
{

    allot_company_resources();

    budget=100000;
   int i;
   vector<Workspace*> vec;
    for(i=0;i<3;i++)
    {
        vec.push_back(createWorkspace());
    }

    for(i=0;i<5;i++)
    {
        all_workspaces[all_ids[i]]->display_info();
    }

    Shared_Bucket *sob=createsharedbucket();
    vector<Workspace*> ws={vec[3],vec[4],vec[5]};

    vector<Resources*> resvec;
    for(i=0;i<4;i++)
    {
        resvec.push_back(allresources.back());
        allresources.pop_back();
    }

    sob->setInfo(ws,1000,resvec);
    vector<Resources*> rrss=sob->get_resources(vec[4],4);



}