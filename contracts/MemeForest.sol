//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract MemeForest is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter public NumOfAllMemes;
    Counters.Counter public NumOfAllMembers;

    struct MemeMembers {
        string Name;
        address MemeberAddress;
        uint MyId;
        uint MyMemes;
        uint MyStarredMemes;
        uint MyDeletedMemes;
        string Datejoined;
    }

    mapping(uint => MemeMembers) private IdMembers;
    mapping(address => bool) private alreadyAMember;
    mapping(address => mapping(uint => bool )) private DidyouStar;
    mapping(address => mapping(uint => bool )) private DidyouLike;

    struct MemeFiles {
        string Memeinfo;
        address Owner;
        uint fileId;
        bool starred;
        uint Stars;
        uint Likes;
        string DateOfCreation;
      
    }

    mapping (uint => MemeFiles) private IdMemeFiles;
    mapping(uint => address) private StarredMemeFiles;

     uint public NumberOfUploads;



    function CreateMembers (string memory _name, string memory _date) public nonReentrant{
        require(alreadyAMember[msg.sender] == false, "You are already a member");

        NumOfAllMembers.increment();
        uint currentMemberId = NumOfAllMembers.current();

        IdMembers[currentMemberId] = MemeMembers (
            _name,
            msg.sender,
            currentMemberId,
            0,
            0,
            0,
            _date

        );

        alreadyAMember[msg.sender] = true;

    }


    function fetchMembers() public view returns(MemeMembers[] memory) {
        uint currentMemberNum = NumOfAllMembers.current();
        uint currentIndex = 0;
        MemeMembers[] memory members = new MemeMembers[] (currentMemberNum);
        for (uint256 index = 0; index < currentMemberNum; index++) {
            uint currenNum = IdMembers[index + 1].MyId;
            MemeMembers storage memeMem = IdMembers[currenNum];
            members[currentIndex] = memeMem;
            currentIndex+=1;
        }
        return members;
    }


    function GetMemberByAddr(address _member)external view returns(MemeMembers[] memory){
        uint currentMemberNum = NumOfAllMembers.current();
        uint currentIndex = 0;
        MemeMembers[] memory foundMember = new MemeMembers[] (1);
        for(uint i = 0; i< currentMemberNum; i++){
            if(_member == IdMembers[i+1].MemeberAddress ){
                uint currentmem = IdMembers[i+1].MyId;
                MemeMembers storage memMem = IdMembers[currentmem];
                foundMember[currentIndex] = memMem;
            }
        }
        return foundMember;

    }


    function IsAMember(address sender) external view returns(bool) {
        bool member = alreadyAMember[sender];
        return member;
    }

    function CreateMemeItems( string memory memeinfo,
    address _owner, 
    string memory _date
    ) 
    public nonReentrant{
        NumOfAllMemes.increment();
        uint256 currentMeme =  NumOfAllMemes.current();
        IdMemeFiles[currentMeme] = MemeFiles(
            memeinfo,
            _owner,
            currentMeme,
            false,
            0,
            0,
            _date
            

        );
         uint currentMemberNum = NumOfAllMembers.current();
        for (uint i = 0; i < currentMemberNum; i++) {
            if(_owner == IdMembers[i+1].MemeberAddress){
                uint currentNum = IdMembers[i+1].MyId;
                IdMembers[currentNum].MyMemes +=1;
            }
        }

    }


    function fetchAllMemes() public view returns(MemeFiles[] memory) {

        uint currentMemeNum = NumOfAllMemes.current();

        uint currentIndex = currentMemeNum;
        MemeFiles[] memory memes = new MemeFiles[] (currentMemeNum);

        for (uint256 index = 0; index < currentMemeNum; index++) {
            uint currenNum = IdMemeFiles[index +1].fileId;
            MemeFiles storage memeFiles = IdMemeFiles[currenNum];

            memes[currentIndex - 1] = memeFiles;
            currentIndex-=1;

            
        }
        return memes;
    }

    function LikeMeme(uint _id) public {
        uint currentMemeNum = NumOfAllMemes.current();
        for(uint i = 0; i < currentMemeNum; i++){
            if(_id == IdMemeFiles[i+1].fileId) {
              
                IdMemeFiles[i+1].Likes+=1;
                 DidyouLike[msg.sender][_id]= true;
                
               
            }
        }

    }
    function UnLikeMeme(uint _id) public {
        uint currentMemeNum = NumOfAllMemes.current();
        for(uint i = 0; i < currentMemeNum; i++){
            if(_id == IdMemeFiles[i+1].fileId) {
              
                IdMemeFiles[i+1].Likes-=1;
                  DidyouLike[msg.sender][_id]= false;
                
               
            }
        }

    }
    
    function WhatDidILike (uint _id, address sender) public view returns (bool) {
         bool youLiked =  DidyouLike[sender][_id];
         return youLiked;
    }

    function StarMeme(uint _id ) public {
        uint currentMemeNum = NumOfAllMemes.current();
        uint currentMemberNum = NumOfAllMembers.current();
        for(uint i = 0; i < currentMemeNum; i++){
            if(_id == IdMemeFiles[i+1].fileId) {
                IdMemeFiles[_id].starred = true;
                IdMemeFiles[_id].Stars+=1;

                DidyouStar[msg.sender][_id]= true;
               
                
               
            }
        }
        for (uint index = 0; index < currentMemberNum; index++) {
            if(msg.sender == IdMembers[index+1].MemeberAddress){
                uint currentNum = IdMembers[index+1].MyId;
                IdMembers[currentNum].MyStarredMemes +=1;
            }
        }
    }

    
    function RemoveStarMeme(uint _id) public {
        uint currentMemeNum = NumOfAllMemes.current();
          uint currentMemberNum = NumOfAllMembers.current();
        for(uint i = 0; i < currentMemeNum; i++){
            if(_id == IdMemeFiles[i+1].fileId) {
                IdMemeFiles[_id].starred = true;
                IdMemeFiles[_id].Stars-=1;

                DidyouStar[msg.sender][_id]= false;
               
            }
        }
         for (uint index = 0; index < currentMemberNum; index++) {
            if(msg.sender == IdMembers[index+1].MemeberAddress){
                uint currentNum = IdMembers[index+1].MyId;
                IdMembers[currentNum].MyStarredMemes -=1;
            }
        }

    }

    function WhatDidIStar (uint _id, address sender) public view returns (bool) {
         bool youStarred =  DidyouStar[sender][_id];
         return youStarred;
    }

    function fetchMyStarredMemes(address sender) public view returns (MemeFiles[] memory) {
        uint currentMemeNum = NumOfAllMemes.current();

    uint currentMemberNum = NumOfAllMembers.current();
        uint currentNum;
        for (uint i = 0; i < currentMemberNum; i++) {
            if(sender == IdMembers[i+1].MemeberAddress){
                currentNum = IdMembers[i+1].MyStarredMemes;
                 
            }
        }


        uint currentIndex = currentMemeNum;
        MemeFiles[] memory memes = new MemeFiles[] (currentNum);
        for (uint i = 0; i < currentMemeNum; i++) {
            uint id = IdMemeFiles[i+1].fileId;
            address person = sender;
            if(DidyouStar[person][id] == true && IdMemeFiles[i+1].starred== true ){
            MemeFiles storage memeFiles = IdMemeFiles[id];

            memes[currentIndex - 1] = memeFiles;
            currentIndex-=1;
            }
        }
        return memes;
    }

    function fetchMyMeme(address sender) public view returns (MemeFiles[] memory) {
        address Sender = sender;
        uint currentMemeNum = NumOfAllMemes.current();
         uint currentMemberNum = NumOfAllMembers.current();
        uint currentNum;
        for (uint i = 0; i < currentMemberNum; i++) {
            if(sender == IdMembers[i+1].MemeberAddress){
                currentNum = IdMembers[i+1].MyMemes;
                 
            }
        }
        uint currentIndex = currentMemeNum;
        MemeFiles[] memory memes = new MemeFiles[] (currentNum);
         for (uint i = 0; i < currentMemeNum; i++) {
             uint id = IdMemeFiles[i+1].fileId;
             if( IdMemeFiles[id].Owner == Sender ){
                 
            MemeFiles storage memeFiles = IdMemeFiles[id];

            memes[currentIndex - 1] = memeFiles;
            currentIndex-=1;
             }
         }
         return memes;
    }

 
} 

