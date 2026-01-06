/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_presale_token.json`.
 */
export type SolanaPresaleToken = {
  "address": "HnQPtPdUZnYQpqX14QiP1CFY9x49hUyDCaaXUjRLH1JJ",
  "metadata": {
    "name": "solanaPresaleToken",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "centralPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  45,
                  99,
                  101,
                  110,
                  116,
                  114,
                  97,
                  108,
                  45,
                  108,
                  97,
                  116,
                  101,
                  115,
                  116,
                  45,
                  118,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "userState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  45,
                  117,
                  115,
                  101,
                  114,
                  45,
                  108,
                  97,
                  116,
                  101,
                  115,
                  116,
                  45,
                  118,
                  50
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "distribute",
      "discriminator": [
        191,
        44,
        223,
        207,
        164,
        236,
        126,
        61
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "centralPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  45,
                  99,
                  101,
                  110,
                  116,
                  114,
                  97,
                  108,
                  45,
                  108,
                  97,
                  116,
                  101,
                  115,
                  116,
                  45,
                  118,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "pdaTokenAccount",
          "writable": true
        },
        {
          "name": "userState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  45,
                  117,
                  115,
                  101,
                  114,
                  45,
                  108,
                  97,
                  116,
                  101,
                  115,
                  116,
                  45,
                  118,
                  50
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "enableDistribution",
      "discriminator": [
        137,
        135,
        101,
        193,
        180,
        29,
        138,
        174
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "centralPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  45,
                  99,
                  101,
                  110,
                  116,
                  114,
                  97,
                  108,
                  45,
                  108,
                  97,
                  116,
                  101,
                  115,
                  116,
                  45,
                  118,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeCentralPda",
      "discriminator": [
        181,
        207,
        35,
        189,
        205,
        75,
        225,
        239
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "centralPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  45,
                  99,
                  101,
                  110,
                  116,
                  114,
                  97,
                  108,
                  45,
                  108,
                  97,
                  116,
                  101,
                  115,
                  116,
                  45,
                  118,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "pdaTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "centralPda"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeUser",
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "userState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  45,
                  117,
                  115,
                  101,
                  114,
                  45,
                  108,
                  97,
                  116,
                  101,
                  115,
                  116,
                  45,
                  118,
                  50
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "centralPda",
      "discriminator": [
        70,
        243,
        29,
        3,
        90,
        133,
        118,
        194
      ]
    },
    {
      "name": "userState",
      "discriminator": [
        72,
        177,
        85,
        249,
        76,
        167,
        186,
        126
      ]
    }
  ],
  "events": [
    {
      "name": "depositEvent",
      "discriminator": [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      "name": "distributeEvent",
      "discriminator": [
        110,
        134,
        163,
        31,
        1,
        16,
        107,
        76
      ]
    },
    {
      "name": "enableDistributionEvent",
      "discriminator": [
        68,
        151,
        186,
        135,
        86,
        63,
        106,
        193
      ]
    },
    {
      "name": "initializeCentralPdaEvent",
      "discriminator": [
        226,
        214,
        177,
        34,
        188,
        78,
        132,
        231
      ]
    },
    {
      "name": "initializeUserEvent",
      "discriminator": [
        128,
        4,
        202,
        37,
        255,
        1,
        206,
        197
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "distributionNotEnabled",
      "msg": "Token distribution is not enabled yet"
    },
    {
      "code": 6001,
      "name": "tokensDistributed",
      "msg": "Tokens have already been distributed"
    },
    {
      "code": 6002,
      "name": "alreadyDistributed",
      "msg": "Tokens have already been distributed to this user"
    },
    {
      "code": 6003,
      "name": "mathOverflow",
      "msg": "Some error with the token amount"
    }
  ],
  "types": [
    {
      "name": "centralPda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isDistributable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "depositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userPubkey",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "centralPda",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "distributeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "userState",
            "type": "pubkey"
          },
          {
            "name": "userPubkey",
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "enableDistributionEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "centralPda",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "initializeCentralPdaEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "centralPda",
            "type": "pubkey"
          },
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "initializeUserEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userPubkey",
            "type": "pubkey"
          },
          {
            "name": "userStatePda",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userPubkey",
            "type": "pubkey"
          },
          {
            "name": "solTransferred",
            "type": "u64"
          },
          {
            "name": "isDistributed",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
