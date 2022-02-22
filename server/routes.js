const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');

// TODO: fill in your connection details here
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect();


// ********************************************
//            SIMPLE ROUTE EXAMPLE
// ********************************************

// Route 1 (handler)
async function hello(req, res) {
    // a GET request to /hello?name=Steve
    if (req.query.name) {
        res.send(`Hello, ${req.query.name}! Welcome to the FIFA server!`)
    } else {
        res.send(`Hello! Welcome to the FIFA server!`)
    }
}


// ********************************************
//                  WARM UP 
// ********************************************

// Route 2 (handler)
async function jersey(req, res) {
    const colors = ['red', 'blue', 'white']
    const jersey_number = Math.floor(Math.random() * 20) + 1
    const name = req.query.name ? req.query.name : "player"

    if (req.params.choice === 'number') {
        // TODO: TASK 1: inspect for issues and correct 
        res.json({ message: `Hello, ${name}!`, jersey_number: jersey_number })
    } else if (req.params.choice === 'color') {
        var lucky_color_index = Math.floor(Math.random() * 2);
        // TODO: TASK 2: change this or any variables above to return only 'red' or 'blue' at random (go Quakers!)
        res.json({ message: `Hello, ${name}!`, jersey_color: colors[lucky_color_index] })
    } else {
        // TODO: TASK 3: inspect for issues and correct
        res.json({ message: `Hello, ${name}, we like your jersey!` })
    }
}

// ********************************************
//               GENERAL ROUTES
// ********************************************


// Route 3 (handler)
async function all_matches(req, res) {
    // TODO: TASK 4: implement and test, potentially writing your own (ungraded) tests
    // We have partially implemented this function for you to 
    // parse in the league encoding - this is how you would use the ternary operator to set a variable to a default value
    // we didn't specify this default value for league, and you could change it if you want! 
    // in reality, league will never be undefined since URLs will need to match matches/:league for the request to be routed here... 
    const league = req.params.league ? req.params.league : 'D1'
    // use this league encoding in your query to furnish the correct results

    if (req.query.page && !isNaN(req.query.page)) {
        // This is the case where page is defined.
        // The SQL schema has the attribute OverallRating, but modify it to match spec! 
        // TODO: query and return results here:
        if (!req.query.pagesize || isNaN(req.query.pagesize)) {
            req.query.pagesize = 10
        }
        const offset = (req.query.page - 1) * req.query.pagesize
        connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals  
        FROM Matches 
        WHERE Division = '${league}'
        ORDER BY HomeTeam, AwayTeam
        LIMIT ${offset}, ${req.query.pagesize};`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
   
    } else {
        // we have implemented this for you to see how to return results by querying the database
        connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals  
        FROM Matches 
        WHERE Division = '${league}'
        ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }
}

// Route 4 (handler)
async function all_players(req, res) {
    // TODO: TASK 5: implement and test, potentially writing your own (ungraded) tests
    if (req.query.page && !isNaN(req.query.page)) {
        if (!req.query.pagesize || isNaN(req.query.pagesize)) {
            req.query.pagesize = 10
        }
        const offset = (req.query.page - 1) * req.query.pagesize
        connection.query(`SELECT PlayerId, Name, Nationality, OverallRating as Rating, Potential, Club, Value  
        FROM Players
        LIMIT ${offset}, ${req.query.pagesize};`, function (error, results, fields) {
    
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }
    else {
        connection.query(`SELECT PlayerId, Name, Nationality, OverallRating as Rating, Potential, Club, Value  
        FROM Players;`, function (error, results, fields) {
    
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });        
    }

}


// ********************************************
//             MATCH-SPECIFIC ROUTES
// ********************************************

// Route 5 (handler)
async function match(req, res) {
    // TODO: TASK 6: implement and test, potentially writing your own (ungraded) tests

    if (req.query.id) {
        connection.query(`SELECT MatchId, Date, Time, 
        HomeTeam as Home, AwayTeam as Away, FullTimeGoalsH as HomeGoals, 
        FullTimeGoalsA as AwayGoals, HalfTimeGoalsH as HTHomeGoals, 
        HalfTimeGoalsA as HTAwayGoals, ShotsH as ShotsHome, ShotsA as ShotsAway, 
        ShotsOnTargetH as ShotsOnTargetHome, ShotsOnTargetA as ShotsOnTargetAway, 
        FoulsH as FoulsHome, FoulsA as FoulsAway, CornersH as CornersHome, 
        CornersA as CornersAway, YellowCardsH as YCHome, YellowCardsA as YCAway, 
        RedCardsH as RCHome, RedCardsA as RCAway 
        FROM Matches
        WHERE MatchId = ${req.query.id};`, 
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }
}

// ********************************************
//            PLAYER-SPECIFIC ROUTES
// ********************************************

// Route 6 (handler)
async function player(req, res) {
    // TODO: TASK 7: implement and test, potentially writing your own (ungraded) tests
     // json.parse(json.stringify(results))
     if (req.query.id) {
        connection.query(`SELECT PlayerId, Name, Age, Photo, Nationality,
        Flag, OverallRating as Rating, Potential, Club, ClubLogo, Value,
        Wage, InternationalReputation, Skill, JerseyNumber, ContractValidUntil,
        Height, Weight, BestPosition, BestOverallRating, ReleaseClause,
        GKPenalties, GKDiving, GKHandling, GKKicking, GKPositioning, GKReflexes,
        NPassing, NBallControl, NAdjustedAgility, NStamina, NStrength, NPositioning
        FROM Players
        WHERE PlayerId = ${req.query.id};`, 
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                if (results.length == 0) {
                    res.json({ results: results })
                } 
                else {
                    if (results[0].BestPosition != 'GK') {
                        console.log(results[0])
                        const {GKPenalties, GKDiving, GKHandling, GKKicking, GKPositioning, GKReflexes, ...filtered} = results[0]
                        results[0] = filtered
                        res.json({results : results})
                    }
                    else {
                        console.log(results[0])
                        const {NPassing, NBallControl, NAdjustedAgility,NStamina, NStrength, NPositioning, ...filtered} = results[0]
                        results[0] = filtered
                        res.json({results : results})
                    }
                }
                
            }
        });
    }

}


// ********************************************
//             SEARCH ROUTES
// ********************************************

// Route 7 (handler)
async function search_matches(req, res) {
    // TODO: TASK 8: implement and test, potentially writing your own (ungraded) tests
    // IMPORTANT: in your SQL LIKE matching, use the %query% format to match the search query to substrings, not just the entire string
    const home = (req.query.Home) ? req.query.Home: ''
    const away = req.query.Away ? req.query.Away : ''
    if (req.query.page && !(isNaN(req.query.page))) {
        if (!req.query.pagesize || isNaN(req.query.pagesize)) {
            req.query.pagesize = 10
        }
        const offset = (req.query.page - 1) * req.query.pagesize
        connection.query(
            `SELECT MatchId, Date, Time, HomeTeam as Home, AwayTeam as Away,
            FullTimeGoalsH as HomeGoals, FullTimeGoalsA as AwayGoals
            FROM Matches
            WHERE HomeTeam LIKE '%${home}%' AND AwayTeam LIKE '%${away}%'
            ORDER By HomeTeam, AwayTeam
            LIMIT ${offset}, ${req.query.pagesize};`,
            function (error, results, fields) {
                if (error) {
                    console.log(error)
                    res.json({ error: error })
                } else if (results) {
                    res.json({ results: results })
                }
            });
    }
    else {
        connection.query(
            `SELECT MatchId, Date, Time, HomeTeam as Home, AwayTeam as Away,
            FullTimeGoalsH as HomeGoals, FullTimeGoalsA as AwayGoals
            FROM Matches
            WHERE HomeTeam LIKE '%${home}%' AND AwayTeam LIKE '%${away}%'
            ORDER By HomeTeam, AwayTeam;`,
            function (error, results, fields) {
                if (error) {
                    console.log(error)
                    res.json({ error: error })
                } else if (results) {
                    res.json({ results: results })
                }
            });  
    }

}

// Route 8 (handler)
async function search_players(req, res) {
    // TODO: TASK 9: implement and test, potentially writing your own (ungraded) tests
    // IMPORTANT: in your SQL LIKE matching, use the %query% format to match the search query to substrings, not just the entire string
    const name = req.query.Name ? req.query.Name: ''
    const nationality = req.query.Nationality ? req.query.Nationality: ''
    const club = req.query.Club ? req.query.Club : ''
    const rating_low = (req.query.RatingLow && !isNaN(req.query.RatingLow)) ? req.query.RatingLow : 0
    const rating_high = (req.query.RatingHigh && !isNaN(req.query.RatingHigh)) ? req.query.RatingHigh : 100
    const potential_low = (req.query.PotentialLow && !isNaN(req.query.PotentialLow)) ? req.query.PotentialLow : 0
    const potential_high = (req.query.PotentialHigh && !isNaN(req.query.PotentialHigh)) ? req.query.PotentialHigh : 100
    
    
    if (req.query.page && !(isNaN(req.query.page))) {
        if (!req.query.pagesize || isNaN(req.query.pagesize)) {
            req.query.pagesize = 10
        }
        const offset = (req.query.page - 1) * req.query.pagesize
        connection.query(
            `SELECT PlayerId, Name, Nationality, OverallRating as Rating, Potential,
            Club, Value
            FROM Players
            WHERE Name LIKE '%${name}%' AND Nationality LIKE '%${nationality}%'
            AND OverallRating >= ${rating_low} AND OverallRating <= ${rating_high}
            AND Potential >= ${potential_low} AND Potential <= ${potential_high}
            ORDER By Name
            LIMIT ${offset}, ${req.query.pagesize};`,
            function (error, results, fields) {
                if (error) {
                    console.log(error)
                    res.json({ error: error })
                } else if (results) {
                    res.json({ results: results })
                }
            });
    }
    else {
        connection.query(
            `SELECT PlayerId, Name, Nationality, OverallRating as Rating, Potential,
            Club, Value
            FROM Players
            WHERE Name LIKE '%${name}%' AND Nationality LIKE '%${nationality}%'
            AND OverallRating >= ${rating_low} AND OverallRating <= ${rating_high}
            AND Potential >= ${potential_low} AND Potential <= ${potential_high}
            ORDER By Name;`,
            function (error, results, fields) {
                if (error) {
                    console.log(error)
                    res.json({ error: error })
                } else if (results) {
                    res.json({ results: results })
                }
            });  
    }
}

module.exports = {
    hello,
    jersey,
    all_matches,
    all_players,
    match,
    player,
    search_matches,
    search_players
}