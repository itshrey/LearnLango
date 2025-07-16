import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getFriendRequests,
  acceptFriendRequest,
  getOutgoingFriendReqs,
  declineFriendRequest,
  cancelFriendRequest,
  getUserFriends,
} from "../lib/api";
import { Link } from "react-router";
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserCheckIcon,
  UsersIcon,
  XCircleIcon,
  MessageCircleIcon,
  PhoneIcon,
  HeartIcon
} from "lucide-react";

import { capitialize } from "../lib/utils";
import { getLanguageFlag } from "../components/FriendCard";

const FriendRequestsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("received");

  const { data: friendRequests = { incomingReqs: [], acceptedReqs: [] }, isLoading: loadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { data: outgoingRequests = [], isLoading: loadingOutgoing } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { mutate: acceptRequestMutation, isPending: isAccepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const { mutate: declineRequestMutation, isPending: isDeclining } = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  const { mutate: cancelRequestMutation, isPending: isCancelling } = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  const handleAcceptRequest = (requestId) => {
    acceptRequestMutation(requestId);
  };

  const handleDeclineRequest = (requestId) => {
    declineRequestMutation(requestId);
  };

  const handleCancelRequest = (requestId) => {
    cancelRequestMutation(requestId);
  };

  const renderRequestCard = (request, type) => {
    const user = type === "received" ? request.sender : request.recipient;
    const isAccepted = request.status === "accepted";
    
    return (
      <div
        key={request._id}
        className="card bg-base-200 hover:shadow-lg transition-all duration-300"
      >
        <div className="card-body p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="avatar size-16 rounded-full">
              <img src={user.profilePic} alt={user.fullName} />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.fullName}</h3>
              {user.location && (
                <div className="flex items-center text-xs opacity-70 mt-1">
                  <MapPinIcon className="size-3 mr-1" />
                  {user.location}
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="flex items-center">
              {type === "sent" && (
                <div className="badge badge-warning gap-1">
                  <ClockIcon className="size-3" />
                  Pending
                </div>
              )}
              {type === "received" && !isAccepted && (
                <div className="badge badge-info gap-1">
                  <UsersIcon className="size-3" />
                  New
                </div>
              )}
              {isAccepted && (
                <div className="badge badge-success gap-1">
                  <CheckCircleIcon className="size-3" />
                  Accepted
                </div>
              )}
            </div>
          </div>

          {/* Languages with flags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="badge badge-secondary">
              {getLanguageFlag(user.nativeLanguage)}
              Native: {capitialize(user.nativeLanguage)}
            </span>
            <span className="badge badge-outline">
              {getLanguageFlag(user.learningLanguage)}
              Learning: {capitialize(user.learningLanguage)}
            </span>
          </div>

          {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

          {/* Action buttons */}
          {type === "received" && !isAccepted && (
            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-primary flex-1"
                onClick={() => handleAcceptRequest(request._id)}
                disabled={isAccepting || isDeclining}
              >
                {isAccepting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <UserCheckIcon className="size-4 mr-2" />
                    Accept
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline btn-error flex-1"
                onClick={() => handleDeclineRequest(request._id)}
                disabled={isAccepting || isDeclining}
              >
                {isDeclining ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircleIcon className="size-4 mr-2" />
                    Decline
                  </>
                )}
              </button>
            </div>
          )}

          {type === "sent" && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="text-center text-sm opacity-70">
                <ClockIcon className="size-4 inline mr-1" />
                Waiting for response...
              </div>
              <button 
                className="btn btn-outline btn-sm btn-error"
                onClick={() => handleCancelRequest(request._id)}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircleIcon className="size-4 mr-2" />
                    Cancel Request
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFriendCard = (friend) => {
    return (
      <div
        key={friend._id}
        className="card bg-base-200 hover:shadow-lg transition-all duration-300"
      >
        <div className="card-body p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="avatar size-16 rounded-full">
              <img src={friend.profilePic} alt={friend.fullName} />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{friend.fullName}</h3>
              {friend.location && (
                <div className="flex items-center text-xs opacity-70 mt-1">
                  <MapPinIcon className="size-3 mr-1" />
                  {friend.location}
                </div>
              )}
            </div>

            {/* Friend indicator */}
            <div className="flex items-center">
              <div className="badge badge-success gap-1">
                <HeartIcon className="size-3" />
                Friend
              </div>
            </div>
          </div>

          {/* Languages with flags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="badge badge-secondary">
              {getLanguageFlag(friend.nativeLanguage)}
              Native: {capitialize(friend.nativeLanguage)}
            </span>
            <span className="badge badge-outline">
              {getLanguageFlag(friend.learningLanguage)}
              Learning: {capitialize(friend.learningLanguage)}
            </span>
          </div>

          {friend.bio && <p className="text-sm opacity-70">{friend.bio}</p>}

          {/* Friend action buttons */}
          <div className="flex gap-2 mt-4">
            <Link 
              to={`/chat/${friend._id}`}
              className="btn btn-primary flex-1"
            >
              <MessageCircleIcon className="size-4 mr-2" />
              Message
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="btn btn-ghost btn-sm">
              <ArrowLeftIcon className="size-4" />
            </Link>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Friends & Requests</h2>
              <p className="opacity-70 text-sm">Manage your friends and friend requests</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed w-fit">
          <button
            className={`tab ${activeTab === "friends" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <HeartIcon className="size-4 mr-2" />
            Friends ({friends.length})
          </button>
          <button
            className={`tab ${activeTab === "received" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("received")}
          >
            <UsersIcon className="size-4 mr-2" />
            Received ({friendRequests.incomingReqs.length})
          </button>
          <button
            className={`tab ${activeTab === "sent" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            <ClockIcon className="size-4 mr-2" />
            Sent ({outgoingRequests.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "friends" && (
          <div>
            {loadingFriends ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : friends.length === 0 ? (
              <div className="card bg-base-200 p-8 text-center">
                <HeartIcon className="size-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
                <p className="text-base-content opacity-70">
                  You haven't added any friends yet. Start by sending some friend requests!
                </p>
                <Link to="/" className="btn btn-primary mt-4">
                  Find Friends
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((friend) => renderFriendCard(friend))}
              </div>
            )}
          </div>
        )}

        {activeTab === "received" && (
          <div>
            {loadingRequests ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : friendRequests.incomingReqs.length === 0 ? (
              <div className="card bg-base-200 p-8 text-center">
                <UsersIcon className="size-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg mb-2">No friend requests</h3>
                <p className="text-base-content opacity-70">
                  You don't have any pending friend requests at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friendRequests.incomingReqs.map((request) =>
                  renderRequestCard(request, "received")
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div>
            {loadingOutgoing ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : outgoingRequests.length === 0 ? (
              <div className="card bg-base-200 p-8 text-center">
                <ClockIcon className="size-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg mb-2">No sent requests</h3>
                <p className="text-base-content opacity-70">
                  You haven't sent any friend requests yet.
                </p>
                <Link to="/" className="btn btn-primary mt-4">
                  Find Friends
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outgoingRequests.map((request) =>
                  renderRequestCard(request, "sent")
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequestsPage;