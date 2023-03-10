const AWS = require("aws-sdk");

const configuration = {
  region: "us-east-1",
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  accessKeyId: process.env.REACT_APP_SECRET_ACCESS_ID,
};

AWS.config.update(configuration);

const docClient = new AWS.DynamoDB.DocumentClient();

export const getRandomId = () => (Math.random() * Date.now()).toString(36);

// Grab all data from a table
//  tableName: admin_announcements | users | hoursLog
export const fetchData = async (tableName) => {
  var params = { TableName: tableName };
  var cont = true;
  var ret = [];

  const entries = await new Promise((resolve, reject) => {
    docClient.scan(params, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
  ret = ret.concat(entries.Items);

  if (!("LastEvaluatedKey" in entries)) {
    return entries.Items;
  } else {
    params = {
      TableName: tableName,
      ExclusiveStartKey: entries.LastEvaluatedKey,
    };
  }

  while (cont) {
    const entries = await new Promise((resolve, reject) => {
      docClient.scan(params, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
    ret = ret.concat(entries.Items);
    if (!("LastEvaluatedKey" in entries)) {
      cont = false;
    } else {
      params = {
        TableName: tableName,
        ExclusiveStartKey: entries.LastEvaluatedKey,
      };
    }
  }

  //console.log(ret);
  return ret;
};

export const fetchUser = async (tableName, user) => {
  var params = {
    Key: {
      username: user,
    },
    TableName: tableName,
  };
  const entries = await new Promise((resolve, reject) => {
    docClient.get(params, function (err, data) {
      if (err) reject(err);
      else resolve(data.Item);
    });
  });

  return entries;
};

// Store `data` in `tableName`
//  tableName: admin_announcements | users | hoursLog
export const putData = (tableName, data) => {
  console.log("PUTDATA");
  console.log(data);
  var params = {
    TableName: tableName,
    Item: data,
  };

  docClient.put(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
};

export const deleteAnnouncement = (itemKey) => {
  console.log(itemKey);
  var params = {
    Key: {
      primary_id: itemKey,
    },
    TableName: "admin_announcements",
  };

  docClient.delete(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to delete item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

export const deleteVolunteer = (itemKey, tableName) => {
  console.log(itemKey);
  var params = {
    Key: {
      username: itemKey,
    },
    TableName: tableName,
  };

  docClient.delete(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to delete item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

export const deleteHour = (itemKey) => {
  console.log(itemKey);
  var params = {
    Key: {
      primary_id: itemKey,
    },
    TableName: "logged_hours",
  };

  docClient.delete(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to delete item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

export const changeHours = (user, newHours, tableName) => {
  console.log("In Change Hours");
  console.log(user);
  console.log(newHours);
  var params = {
    TableName: tableName,
    Key: {
      username: user,
    },
    UpdateExpression: "set #totalHours= :x",
    ExpressionAttributeNames: { "#totalHours": "totalHours" },
    ExpressionAttributeValues: { ":x": newHours },
  };

  docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Update succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

export const updateVolunteerInformation = (user, item) => {
  console.log("In Update Volunteer Information");
  console.log(user);
  console.log(item);
  var params = {
    TableName: "volunteers_individual",
    Key: {
      username: user,
    },
    UpdateExpression:
      "SET #hourGoal= :x, #Group= :y, #CommunityService= :a, #CWR= :b, #EC= :c, #ECP= :d, #PhotoP= :e, #STS= :f, #SP= :g, #VolWaiverRelease= :h, #liveScanned= :i, #mailing_address= :j",
    ExpressionAttributeNames: {
      "#hourGoal": "hourGoal",
      "#Group": "Group",
      "#CommunityService": "Community Service",
      "#CWR": "Covid_Waiver_and_Release",
      "#EC": "Emergency_Contact",
      "#ECP": "Emergency_Contact_Phone",
      "#PhotoP": "Photo-Permission",
      "#STS": "Safety Training Status",
      "#SP": "Secondary Phone",
      "#VolWaiverRelease": "Volunter_Waiver_and_Release",
      "#liveScanned": "liveScanned",
      "#mailing_address": "mailing_address",
    },
    ExpressionAttributeValues: {
      ":x": item.hourGoal,
      ":y": item.Group,
      ":a": item["Community Service"],
      ":b": item.Covid_Waiver_and_Release,
      ":c": item.Emergency_Contact,
      ":d": item.Emergency_Contact_Phone,
      ":e": item["Photo-Permission"],
      ":f": item["Safety Training Status"],
      ":g": item["Secondary Phone"],
      ":h": item.Volunter_Waiver_and_Release,
      ":i": item.liveScanned,
      ":j": item.mailing_address,
    },
  };

  docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Update succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

export const changeVolunteerStatus = (user, tableName, newValue) => {
  console.log(user);
  console.log(tableName);
  console.log(newValue);

  var params = {
    TableName: tableName,
    Key: {
      username: user,
    },
    UpdateExpression: "set #is_Admin= :x",
    ExpressionAttributeNames: { "#is_Admin": "is_Admin" },
    ExpressionAttributeValues: { ":x": newValue },
  };

  docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Update succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

export const updatePersonalInfo = (item, table) => {
  console.log("Modifying I");
  console.log(item);
  console.log(table);

  if (table === "volunteers_individual") {
    var params = {
      TableName: "volunteers_individual",
      Key: {
        username: item.username,
      },
      UpdateExpression:
        "SET #hourGoal= :x, #Group= :y, #CommunityService= :a, #CWR= :b, #EC= :c, #ECP= :d, #PhotoP= :e, #STS= :f, #SP= :g, #VolWaiverRelease= :h, #liveScanned= :i, #mailing_address= :j, #first= :k, #last=:l, #primary=:m, #birth=:n, #medical=:o",
      ExpressionAttributeNames: {
        "#hourGoal": "hourGoal",
        "#Group": "Group",
        "#CommunityService": "Community Service",
        "#CWR": "Covid_Waiver_and_Release",
        "#EC": "Emergency_Contact",
        "#ECP": "Emergency_Contact_Phone",
        "#PhotoP": "Photo-Permission",
        "#STS": "Safety Training Status",
        "#SP": "Secondary Phone",
        "#VolWaiverRelease": "Volunter_Waiver_and_Release",
        "#liveScanned": "liveScanned",
        "#mailing_address": "mailing_address",
        "#first": "First Name",
        "#last": "Last Name",
        "#primary": "Primary Phone",
        "#birth": "Birth_date",
        "#medical": "Medical_Conditions",
      },
      ExpressionAttributeValues: {
        ":x": item.hourGoal,
        ":y": item.Group,
        ":a": item["Community Service"],
        ":b": item.Covid_Waiver_and_Release,
        ":c": item.Emergency_Contact,
        ":d": item.Emergency_Contact_Phone,
        ":e": item["Photo-Permission"],
        ":f": item["Safety Training Status"],
        ":g": item["Secondary Phone"],
        ":h": item.Volunter_Waiver_and_Release,
        ":i": item.liveScanned,
        ":j": item.mailing_address,
        ":k": item["First Name"],
        ":l": item["Last Name"],
        ":m": item["Primary Phone"],
        ":n": item.Birth_date,
        ":o": item.Medical_Conditions,
      },
    };
  } else {
    params = {
      TableName: "volunteers_group",
      Key: {
        username: item.username,
      },
      UpdateExpression:
        "SET #hourGoal= :x, #groupName= :y, #PC= :a, #NC= :b, #SS= :c",
      ExpressionAttributeNames: {
        "#hourGoal": "hourGoal",
        "#groupName": "groupName",
        "#PC": "phoneContact",
        "#NC": "nameContact",
        "#SS": "safetyStatus",
      },
      ExpressionAttributeValues: {
        ":x": item.hourGoal,
        ":y": item.groupName,
        ":a": item.phoneContact,
        ":b": item.nameContact,
        ":c": item.safetyStatus,
      },
    };
  }

  docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Update succeeded:", JSON.stringify(data, null, 2));
    }
  });
};
